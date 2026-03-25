const express = require('express');
const router = express.Router();

router.post('/chat', (req, res) => {
  const { message } = req.body;

  // temporary dummy response
  res.json({
    reply: `You said: ${message}`
  });
});

module.exports = router;