// backend/src/routes/logs.js
const express = require('express');
const router = express.Router();
const { RoutineLog } = require('../models');

router.post('/', async (req,res) => {
  try {
    const l = await RoutineLog.create(req.body);
    res.json(l);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

router.get('/user/:uid', async (req,res) => {
  const logs = await RoutineLog.findAll({ where: { user_id: req.params.uid }, order: [['start_time','DESC']]});
  res.json(logs);
});

module.exports = router;
