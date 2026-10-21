const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const secret = () => process.env.JWT_SECRET;

function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    secret(),
    { expiresIn: '15m' }
  );
}

function signRefreshToken(user) {
  // jwtid makes every refresh token unique, even if issued in the same second.
  return jwt.sign({ id: user.id, type: 'refresh' }, secret(), {
    expiresIn: '7d',
    jwtid: crypto.randomUUID(),
  });
}

function verifyToken(token) {
  return jwt.verify(token, secret());
}

module.exports = { signAccessToken, signRefreshToken, verifyToken };
