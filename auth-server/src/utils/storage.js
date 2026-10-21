// Node has no built-in localStorage, so this mimics its API (getItem/setItem)
// and persists to a JSON file inside this server's data/ folder.
const fs = require('fs');
const path = require('path');

const FILE = path.resolve(__dirname, '../../data/localStorage.json');
fs.mkdirSync(path.dirname(FILE), { recursive: true });

let store = {};
if (fs.existsSync(FILE)) {
  try {
    store = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch {
    store = {};
  }
}

const localStorage = {
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
  },
  setItem(key, value) {
    store[key] = String(value);
    fs.writeFileSync(FILE, JSON.stringify(store, null, 2));
  },
};

// Read an array from storage on startup.
function load(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Write an array back after every modification.
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

module.exports = { load, save };
