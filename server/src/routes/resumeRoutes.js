const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { requireAuth } = require('../middleware/authMiddleware');
const { uploadResume } = require('../middleware/uploadMiddleware');

router.use(requireAuth);

router.post('/upload', uploadResume.single('resume'), resumeController.uploadAndParseResume);
router.get('/', resumeController.getResumes);
router.get('/:id', resumeController.getResumeById);
router.put('/:id', resumeController.updateResume);
router.delete('/:id', resumeController.deleteResume);

module.exports = router;
