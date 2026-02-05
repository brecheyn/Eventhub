const { body } = require('express-validator');

const createEventValidator = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().trim(),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('maxCapacity').optional().isInt({ min: 1 }).withMessage('Max capacity must be positive'),
  body('ticketPrice').optional().isDecimal().withMessage('Invalid ticket price'),
  body('isFree').optional().isBoolean()
];

module.exports = { createEventValidator };
