// server.js
const express = require("express");
const path = require("path");
const users = require("./db"); // our "database" (array from db.js)

const app = express();
const PORT = 3000;

// Lets Express read JSON that comes in the request body
app.use(express.json());

// Shows the HTML pages inside the "public" folder.
// When you open http://localhost:3000, signup.html loads first.
app.use(express.static(path.join(__dirname, "public"), { index: "signup.html" }));


// ---------------- SIGNUP ----------------
// POST /api/signup
app.post("/api/signup", (req, res) => {
  const { email, username, password } = req.body || {};

  // 400 - one or more fields are empty
  if (!email || !username || !password) {
    return res.status(400).json({ message: "Please fill in all fields." });
  }

  // 409 - the username or email is already taken
  const existingUser = users.find(
    (user) => user.username === username || user.email === email
  );

  if (existingUser) {
    return res.status(409).json({ message: "User already exists." });
  }

  // Make a new user with its own id and save it in the array
  const newUser = {
    id: users.length + 1,
    email: email,
    username: username,
    password: password
  };

  users.push(newUser);

  // 201 - new user was created
  // (we don't send the password back)
  res.status(201).json({
    message: "Signup successful!",
    user: { id: newUser.id, email: newUser.email, username: newUser.username }
  });
});


// ---------------- LOGIN ----------------
// POST /api/login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};

  // 400 - one or both fields are empty
  if (!username || !password) {
    return res.status(400).json({ message: "Please fill in all fields." });
  }

  // Look for a user with the same username AND password
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  // 401 - no match found
  if (!user) {
    return res.status(401).json({ message: "Wrong username or password." });
  }

  // 200 - user exists, login is okay
  res.status(200).json({
    message: "Login successful!",
    user: { id: user.id, username: user.username }
  });
});


app.listen(PORT, () => {
  console.log("Server is running at http://localhost:" + PORT);
});
