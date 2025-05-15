const { body, validationResult } = require('express-validator');

const signupValidation = [
  body('farm_name')
    .trim()
    .notEmpty()
    .withMessage('Farm name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Farm name must be between 3 and 100 characters'),
  body('email')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

const signinValidation = [
  body('email')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = { signupValidation, signinValidation, validate };