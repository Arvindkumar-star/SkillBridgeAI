const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { analyzeRequestSchema, simulateRequestSchema } = require('../validators');

router.use(requireAuth);

router.post('/run', validate(analyzeRequestSchema), analysisController.runAnalysis);
router.post('/simulate', validate(simulateRequestSchema), analysisController.simulateWhatIf);
router.get('/history', analysisController.getAnalysisHistory);
router.get('/job/:jobId', analysisController.getJobAnalysis);
router.get('/:id', analysisController.getAnalysisById);

module.exports = router;
