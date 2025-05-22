const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT
const auth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Create batch
router.post('/', auth, async (req, res) => {
  const { batchName, inputDate, eggCount, farmName } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO batches (farm_name, batch_name, input_date, egg_count) VALUES ($1, $2, $3, $4) RETURNING *',
      [farmName, batchName, inputDate, eggCount]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all batches for a farm
router.get('/', auth, async (req, res) => {
  const { farmName } = req.query;
  try {
    const result = await pool.query('SELECT * FROM batches WHERE farm_name = $1', [farmName]);
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update hatched count and calculate hatch rate
router.put('/:id', auth, async (req, res) => {
  const { hatchedCount } = req.body;
  const { id } = req.params;
  try {
    const batchResult = await pool.query('SELECT egg_count FROM batches WHERE id = $1', [id]);
    if (batchResult.rows.length === 0) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    const eggCount = batchResult.rows[0].egg_count;
    const hatchRate = (hatchedCount / eggCount) * 100;
    const result = await pool.query(
      'UPDATE batches SET hatched_count = $1, hatch_rate = $2 WHERE id = $3 RETURNING *',
      [hatchedCount, hatchRate, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;