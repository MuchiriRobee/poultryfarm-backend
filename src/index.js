const express = require('express');
const authRoutes = require('./routes/auth');
require('dotenv').config();
const batchRoutes = require('./routes/batch');
const pool = require('./config/db');

const app = express();

app.use(express.json());
// Test database connection
pool.connect((err) => {
    if (err) {
      console.error('PostgreSQL connection error:', err);
    } else {
      console.log('Connected to PostgreSQL');
    }
  });

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/batch', batchRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));