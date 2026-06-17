(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? module.exports = factory()
    : typeof define === 'function' && define.amd
      ? define(factory)
      : (global.Logger = factory());
}(this, function () {
  var SERVER_URL = 'https://logger-eight-sooty.vercel.app';

  function getDevice() {
    if (typeof navigator === 'undefined') return 'unknown';
    if (/android/i.test(navigator.userAgent)) return 'android';
    if (/iphone|ipad|ipod/i.test(navigator.userAgent)) return 'ios';
    return 'web';
  }

  function send(level, message, extra) {
    var log = {
      level: level,
      message: message,
      extra: extra || {},
      timestamp: new Date().toISOString(),
      device: getDevice(),
    };
    console.log('[' + level + ']', message, extra || '');
    try {
      fetch(SERVER_URL + '/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log),
      });
    } catch (e) {}
  }

  return {
    info:  function (msg, extra) { send('INFO', msg, extra); },
    warn:  function (msg, extra) { send('WARN', msg, extra); },
    error: function (msg, extra) { send('ERROR', msg, extra); },
    debug: function (msg, extra) { send('DEBUG', msg, extra); },
  };
}));
