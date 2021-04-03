const noop = require("lodash.noop");

(function () {
  if (!global.window) {
    global.window = global;
    global.window.addEventListener = noop;
  }

  global.navigator = null;

  return {
    ...global,
    addEventListener: noop,
  };
})();
