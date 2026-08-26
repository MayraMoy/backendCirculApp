const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const { registerSchema, loginSchema, devSwitchRoleSchema } = require('../validators/auth.validator');
const {
  register,
  login,
  devSwitchRole
} = require('../controllers/authController');

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/dev-switch-role', auth, validate(devSwitchRoleSchema), devSwitchRole);

module.exports = router;