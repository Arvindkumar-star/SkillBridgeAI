const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { profileUpdateSchema } = require('../validators');

router.use(requireAuth);

router.get('/profile', userController.getProfile);
router.put('/profile', validate(profileUpdateSchema), userController.updateProfile);
router.post('/skills', userController.addManualSkill);
router.delete('/skills/:skillName', userController.deleteManualSkill);

module.exports = router;
