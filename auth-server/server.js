const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const authRoutes = require('./src/routes/authRoutes');

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing. Create a .env file at the project root (see .env.example).');
  process.exit(1);
}

const PORT = 4000;
const app = express();

app.use(express.json());
app.use('/', authRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => console.log(`Auth Server running on http://localhost:${PORT}`));
