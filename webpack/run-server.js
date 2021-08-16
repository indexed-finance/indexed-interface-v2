const { spawn } = require('child_process');
const path = require('path');
const chalk = require('chalk');

const serverFile = path.join(__dirname, 'server', 'server');

const RESTART_INTERVAL = 7200;

let lastStartTimestamp;
let server;

const formattedTimestamp = () => new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')

const printErr = (msg) => console.log(chalk.red(msg));
const printMsg = (msg) => console.log(`${chalk.green(msg)} | ${formattedTimestamp()}`);
const printData = (msg) => console.log(chalk.white(msg));

const addListeners = () => {
  server.stdout.on('data', (data) => {
    let ln = data.toString();
    const lastNL = ln.lastIndexOf('\n');
    if (lastNL) ln = ln.slice(0, lastNL)
    printData(ln)
  });
  
  server.stderr.on('data', (data) => {
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
}

const restartProcess = () => {
  if (server) {
    killServer()
  } else {
    startServer()
  }
}

startServer()
setInterval(restartProcess, RESTART_INTERVAL * 1000)