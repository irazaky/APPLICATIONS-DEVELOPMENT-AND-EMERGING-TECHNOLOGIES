// In-memory "database" for demo purposes. Data resets when the server restarts.
const users = [];
let nextId = 1;

module.exports = {
  findByEmail: (email) => users.find((u) => u.email === email),
  findById: (id) => users.find((u) => u.id === id),
  getAll: () => users,
  create: ({ name, email, bio, passwordHash }) => {
    const user = {
      id: nextId++,
      name,
      email,
      bio: bio || "",
      passwordHash
    };
    users.push(user);
    return user;
  },
};
