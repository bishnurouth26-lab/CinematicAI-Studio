const appPromise = require('../dist/server.cjs').default;

module.exports = async (req, res) => {
  const app = await appPromise;
  return app(req, res);
};
