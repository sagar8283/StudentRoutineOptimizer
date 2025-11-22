// backend/src/routes/tasks.js
const express = require('express');
const router = express.Router();
const { Task } = require('../models');
const scheduleController = require('../controllers/schedule');

router.post('/', async (req, res) => {
  try {
    const t = await Task.create(req.body);
    if (t && t.user_id) await scheduleController.autoSchedule(t.user_id);
    res.json(t);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/user/:uid', async (req, res) => {
  const tasks = await Task.findAll({ where: { user_id: req.params.uid }, order: [['deadline', 'ASC']]});
  res.json(tasks);
});

router.put('/:id', async (req, res) => {
  const t = await Task.findByPk(req.params.id);
  if (!t) return res.status(404).send('Not found');
  await t.update(req.body);
  res.json(t);
});

router.delete('/:id', async (req,res) => {
  const t = await Task.findByPk(req.params.id);
  if(!t) return res.status(404).send('Not found');
  await t.destroy();
  res.json({ ok: true });
});

module.exports = router;
