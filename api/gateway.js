const app = require('../backend/server');

module.exports = (req, res) => {
  const requestUrl = new URL(req.url, 'http://vercel.local');
  const originalPath = requestUrl.searchParams.get('__originalPath');

  if (originalPath === null) {
    return res.status(400).json({
      success: false,
      message: 'Missing original API path'
    });
  }

  requestUrl.searchParams.delete('__originalPath');
  const originalQuery = requestUrl.searchParams.toString();
  req.url = `/api/${originalPath}${originalQuery ? `?${originalQuery}` : ''}`;

  return app(req, res);
};
