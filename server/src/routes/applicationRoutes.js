const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { applicationCreateSchema } = require('../validators');

router.use(requireAuth);

router.post('/', validate(applicationCreateSchema), applicationController.createApplication);
router.get('/', applicationController.getApplications);
router.put('/:id', applicationController.updateApplication);
router.delete('/:id', applicationController.deleteApplication);

module.exports = router;
