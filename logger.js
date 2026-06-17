// logger.js
const SERVER_URL = 'https://logger-eight-sooty.vercel.app';

const Logger = {
  _send: async (level, message, extra = {}) => {
    const log = {
      level,
      message,
      extra,
      timestamp: new Date().toISOString(),
      device: require('react-native').Platform.OS,
    };
    console.log(`[${level}]`, message, extra);
    try {
      await fetch(`${SERVER_URL}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log),
      });
    } catch (e) {
      // silently fail if server is down
    }
  },

  info:  (msg, extra) => Logger._send('INFO', msg, extra),
  warn:  (msg, extra) => Logger._send('WARN', msg, extra),
  error: (msg, extra) => Logger._send('ERROR', msg, extra),
  debug: (msg, extra) => Logger._send('DEBUG', msg, extra),
};

export default Logger;