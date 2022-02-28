const { spawn, fork } = require('child_process');
const path = require('path');
const chalk = require('chalk');

const serverFile = path.join(__dirname, 'server', 'server');
const stateFile = path.join(__dirname, 'server', 'server-state');

const RESTART_INTERVAL = 7200;
/* 
let lastStartTimestamp;
let server;
 */
const formattedTimestamp = () => new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')

const printErr = (msg) => console.log(chalk.red(msg));
const printWarning = (msg) => console.log(chalk.redBright(msg));
const printMsg = (msg) => console.log(`${chalk.green(msg)} | ${formattedTimestamp()}`);
const printData = (msg) => console.log(chalk.white(msg));

const setupFork = (name, filePath, args = []) => {
  let lastStartTimestamp;
  let _fork;

  const start = () => {
    lastStartTimestamp = Date.now()
    printMsg(`${name}: starting...`);
    _fork = spawn('node', ['--no-warnings', filePath, ...args])
    // _fork = fork(filePath, args,/*  { silent: true } */);
    addListeners();
  }

  const kill = () => {
    if (!_fork.killed) {
      printMsg(`${name}: sending shutdown signal...`)
      _fork.kill('SIGTERM')
    }
  }

  const addListeners = () => {
    _fork.stdout.on('data', (data) => {
      let ln = data.toString();
      const lastNL = ln.lastIndexOf('\n');
      if (lastNL) ln = ln.slice(0, lastNL)
      printData(`${name}: ${ln}`)
    });
    
    _fork.stderr.on('data', (data) => {
      if (data.includes('https://reactjs.org/link/react-polyfills')) return;
      if (data.includes('Warning:')) {
        return printWarning(`${name}: ${data}`)
      }
      printErr(`${name}: ${data}`)
      kill()
    });
  
    _fork.on('close', (code) => {
      const ts = Date.now();
      if (code !== 0) {
        printErr(`${name}: process exited with code ${code}`);
      } else {
        printMsg(`${name}: process exited normally`);
      }
      printMsg(`${name}: ran for ${(ts - lastStartTimestamp) / 1000} seconds | restart interval is ${RESTART_INTERVAL} seconds`)
      start()
    });
  }

  return { start, kill };
}

/* const addListeners = () => {
  server.stdout.on('data', (data) => {
    let ln = data.toString();
    const lastNL = ln.lastIndexOf('\n');
    if (lastNL) ln = ln.slice(0, lastNL)
    printData(ln)
  });
  
  server.stderr.on('data', (data) => {
    if (data.includes('https://reactjs.org/link/react-polyfills')) return;
    printErr(data)
    killServer()
  });

  server.on('close', (code) => {
    const ts = Date.now();
    if (code !== 0) {
      printErr(`server process exited with code ${code}`);
    } else {
      printMsg(`server process exited normally`);
    }
    printMsg(`server ran for ${(ts - lastStartTimestamp) / 1000} seconds | restart interval is ${RESTART_INTERVAL} seconds`)
    startServer()
  });
}

const killServer = () => {
  if (!server.killed) {
    printMsg(`sending shutdown signal to server...`)
    server.kill('SIGTERM')
  }
}

const startServer = () => {
  console.log(chalk.blue('='.repeat(25)));
  console.log(`meta process messages are ${chalk.green('green')}`);
  console.log(`server process messages are ${chalk.white('white')}`);
  console.log(`errors are ${chalk.red('red')}`);
  console.log(chalk.blue('='.repeat(25)));
  printMsg(`running server with a restart interval of ${RESTART_INTERVAL} seconds`)
  printMsg(`starting server...`);
  lastStartTimestamp = Date.now()
  server = spawn('node', [serverFile]);
  addListeners();
} */

const mainnet = setupFork('mainnet', stateFile, ['mainnet']);
const polygon = setupFork('polygon', stateFile, ['polygon']);
const server = setupFork('server', serverFile);

const restart = () => {
  [mainnet, polygon, server].map((child) => child.kill());
}

/* const restartProcess = () => {
  if (server) {
    killServer()
  } else {
    startServer()
  }
}

startServer() */

[mainnet, polygon, server].map((child) => child.start());
setInterval(restart, RESTART_INTERVAL * 1000)