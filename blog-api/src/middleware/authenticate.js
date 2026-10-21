const jwt = require('jsonwebtoken');

// Verifies "Authorization: Bearer <token>" and sets req.user.
// Never calls the Auth Server -- it only needs the shared JWT_SECRET.
module.exports = function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  if (payload.type === 'refresh') {
    return res.status(401).json({ error: 'Refresh tokens cannot be used to access this API' });
  }

  req.user = { id: payload.id, username: payload.username, role: payload.role };
  next();
};
