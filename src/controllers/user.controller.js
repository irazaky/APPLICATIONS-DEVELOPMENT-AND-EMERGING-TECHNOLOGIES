const User = require("../models/user.model");

exports.getMe = (req, res) => {
  const user = User.findById(req.user.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({
    id: user.id,
    username: user.name,
    email: user.email,
    bio: user.bio
  });
};

exports.getUsers = (req, res) => {
  const users = User.getAll();

  res.json(
    users.map((user) => ({
      id: user.id,
      username: user.name,
      email: user.email,
      bio: user.bio
    }))
  );
};
