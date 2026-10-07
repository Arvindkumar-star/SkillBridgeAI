const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { jobCreateSchema } = require('../validators');

router.use(requireAuth);

router.post('/', validate(jobCreateSchema), jobController.createJob);
router.post('/parse-jd', jobController.parseJobDescription);
router.get('/', jobController.getJobs);
router.get('/:id', jobController.getJobById);
router.delete('/:id', jobController.deleteJob);

module.exports = router;
