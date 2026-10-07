const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { roadmapTaskUpdateSchema } = require('../validators');

router.use(requireAuth);

router.post('/generate', roadmapController.generateRoadmap);
router.get('/', roadmapController.getRoadmaps);
router.get('/:id', roadmapController.getRoadmapById);
router.patch('/:id/tasks', validate(roadmapTaskUpdateSchema), roadmapController.updateTask);

module.exports = router;
