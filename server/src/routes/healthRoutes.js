const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Skill-to-Job Intelligence API',
    database: dbStatus,
    version: '1.0.0'
  });
});

module.exports = router;
