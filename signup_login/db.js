// db.js
// This is our "database". It is just an array of user objects.
// Every user has an id, email, username, and password.
// NOTE: the data resets whenever the server restarts.

const users = [
  {
    id: 1,
    email: "demo@example.com",
    username: "demo",
    password: "demo123"
  }
];

module.exports = users;
