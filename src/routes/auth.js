const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { signupValidation, signinValidation, validate } = require('../middleware/validate');

const router = express.Router();

// Signup
router.post('/signup', signupValidation, validate, async (req, res) => {
  const { farm_name, email, password } = req.body;

  try {
    // Check if farm_name or email already exists
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE farm_name = $1 OR email = $2',
      [farm_name, email]
    );
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Farm name or email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const newUser = await pool.query(
      'INSERT INTO users (farm_name, email, password) VALUES ($1, $2, $3) RETURNING id, farm_name, email',
      [farm_name, email, hashedPassword]
    );

    // Generate JWT
    const token = jwt.sign(
      { id: newUser.rows[0].id, farm_name: newUser.rows[0].farm_name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ token, farm_name: newUser.rows[0].farm_name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Signin
router.post('/signin', signinValidation, validate, async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.rows[0].id, farm_name: user.rows[0].farm_name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, farm_name: user.rows[0].farm_name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;