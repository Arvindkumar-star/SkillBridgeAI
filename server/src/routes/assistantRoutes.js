const express = require('express');
const router = express.Router();
const assistantController = require('../controllers/assistantController');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);

router.post('/chat', assistantController.askAssistant);

module.exports = router;
