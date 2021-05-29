import { FEATURE_FLAGS } from '../feature-flags';

const colors = {
  warning: 'orange',
  info: 'darkblue',
  error: 'red'
}

const startTime = Date.now();

function writeLog(severity: 'warning' | 'error' | 'info', ...messages: string[]) {
  if (FEATURE_FLAGS.useDEBUG) {
    const time = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log('%c%s', `color: ${colors[severity]};`, ...messages, ` | ${time} s from start`);
  }
}

export const debugConsole = {
  warn: (...msg: string[]) => writeLog('warning', ...msg),
  log: (...msg: string[]) => writeLog('info', ...msg),
  error: (...msg: string[]) => writeLog('error', ...msg)
}