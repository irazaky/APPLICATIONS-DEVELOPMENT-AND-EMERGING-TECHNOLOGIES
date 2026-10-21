const { load, save } = require('../utils/storage');
const { hashPassword, verifyPassword } = require('../utils/password');
const { signAccessToken, signRefreshToken, verifyToken } = require('../utils/tokens');

const ROLES = ['reader', 'author', 'admin'];
const KEY = 'users';

// In-memory array, hydrated from storage on startup.
const users = load(KEY);
let nextId = users.reduce((max, u) => Math.max(max, u.id), 0) + 1;

const persist = () => save(KEY, users);
const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

function register(req, res) {
  const { username, password, role } = req.body || {};

  if (!isNonEmptyString(username) || !isNonEmptyString(password) || !isNonEmptyString(role)) {
    return res.status(400).json({ error: 'username, password and role are required' });
  }
  if (!ROLES.includes(role)) {
    return res.status(400).json({ error: `role must be one of: ${ROLES.join(', ')}` });
  }

  const name = username.trim();
  if (users.some((u) => u.username.toLowerCase() === name.toLowerCase())) {
    return res.status(409).json({ error: 'Username already taken' });
  }

  const user = {
    id: nextId++,
    username: name,
    hashed_password: hashPassword(password),
    role,
    refresh_token: null,
    created_at: new Date().toISOString(),
    revoked_at: null,
  };
  users.push(user);
  persist();

  res.status(201).json({
    id: user.id,
    username: user.username,
    role: user.role,
    created_at: user.created_at,
  });
}

function login(req, res) {
  const { username, password } = req.body || {};

  if (!isNonEmptyString(username) || !isNonEmptyString(password)) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const user = users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
  if (!user || !verifyPassword(password, user.hashed_password)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  user.refresh_token = refreshToken;
  user.revoked_at = null;
  persist();

  res.status(200).json({ accessToken, refreshToken });
}

function refresh(req, res) {
  const { refreshToken } = req.body || {};

  if (!isNonEmptyString(refreshToken)) {
    return res.status(400).json({ error: 'refreshToken is required' });
  }

  let payload;
  try {
    payload = verifyToken(refreshToken);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }

  if (payload.type !== 'refresh') {
    return res.status(401).json({ error: 'Not a refresh token' });
  }

  const user = users.find((u) => u.id === payload.id);
  if (!user || user.refresh_token !== refreshToken) {
    return res.status(401).json({ error: 'Refresh token has been revoked' });
  }

  res.status(200).json({ accessToken: signAccessToken(user) });
}

function logout(req, res) {
  const { refreshToken } = req.body || {};

  if (!isNonEmptyString(refreshToken)) {
    return res.status(400).json({ error: 'refreshToken is required' });
  }

  const user = users.find((u) => u.refresh_token === refreshToken);
  if (user) {
    user.refresh_token = null;
    user.revoked_at = new Date().toISOString();
    persist();
  }

  res.status(200).json({ message: 'Logged out' });
}

module.exports = { register, login, refresh, logout };
