// backend/src/routes/analytics.js
const express = require('express');
const router = express.Router();
const { RoutineLog, Task } = require('../models');
const { Op } = require('sequelize');

router.get('/daily/:uid', async (req,res) => {
  const uid = Number(req.params.uid);
  const days = Number(req.query.days) || 14;
  const since = new Date(Date.now() - days*24*3600*1000);
  const logs = await RoutineLog.findAll({ where: { user_id: uid, type: 'study', start_time: { [Op.gte]: since } }});
  const map = {};
  for (const l of logs) {
    const d = new Date(l.start_time).toISOString().slice(0,10);
    const mins = Math.round((new Date(l.end_time) - new Date(l.start_time)) / 60000);
    map[d] = (map[d] || 0) + mins;
  }
  res.json(map);
});

router.get('/tasks/summary/:uid', async (req,res) => {
  const uid = Number(req.params.uid);
  const total = await Task.count({ where: { user_id: uid }});
  const completed = await Task.count({ where: { user_id: uid, status: 'completed' }});
  res.json({ total, completed, pending: total - completed });
});

module.exports = router;
