// backend/src/routes/ai.js
const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendation');

router.get('/recommendations/:uid', async (req,res) => {
  try {
    const data = await getRecommendations(Number(req.params.uid));
    res.json(data);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
