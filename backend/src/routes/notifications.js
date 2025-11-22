// backend/src/routes/notifications.js
const express = require('express');
const router = express.Router();

// example in-memory store or DB lookup placeholder
const fakeNotifications = {
  1: { id: 1, title: 'Welcome', body: 'Welcome to the app' },
  2: { id: 2, title: 'Reminder', body: 'Do your task' },
};

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const notification = fakeNotifications[id] || null;

    if (!notification) return res.status(404).json({ error: 'Notification not found' });

    return res.status(200).json(notification);
  } catch (err) {
    console.error('GET /api/notifications/:id error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
