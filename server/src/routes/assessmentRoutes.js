const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { assessmentStartSchema, assessmentSubmitSchema } = require('../validators');

router.use(requireAuth);

router.post('/start', validate(assessmentStartSchema), assessmentController.startAssessment);
router.post('/:id/submit', validate(assessmentSubmitSchema), assessmentController.submitAssessment);
router.get('/', assessmentController.getAssessments);
router.get('/:id', assessmentController.getAssessmentById);

module.exports = router;
