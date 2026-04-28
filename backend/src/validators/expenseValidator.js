import { z } from 'zod';
import { ValidationError } from '../utils/errors.js';

const expenseSchema = z.object({
  amount: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Amount must be a positive number with up to 2 decimal places')
    .refine((val) => parseFloat(val) > 0, 'Amount must be greater than 0'),
  category: z.string().trim().min(1, 'Category is required').max(50, 'Category must be under 50 characters'),
  description: z.string().trim().min(1, 'Description is required').max(255, 'Description must be under 255 characters'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
});

const listQuerySchema = z.object({
  category: z.string().trim().optional(),
  sort: z.enum(['date_desc']).optional(),
});

export const validateCreateExpense = (req, res, next) => {
  const result = expenseSchema.safeParse(req.body);
  if (!result.success) {
    const fields = {};
    result.error.issues.forEach((issue) => {
      fields[issue.path[0]] = issue.message;
    });
    return next(new ValidationError('Invalid expense data', fields));
  }
  
  // Also validate Idempotency-Key header
  const idempotencyKey = req.headers['idempotency-key'];
  if (!idempotencyKey || idempotencyKey.trim() === '') {
    return next(new ValidationError('Idempotency-Key header is required', { 'Idempotency-Key': 'Required' }));
  }

  next();
};

export const validateListQuery = (req, res, next) => {
  const result = listQuerySchema.safeParse(req.query);
  if (!result.success) {
    const fields = {};
    result.error.issues.forEach((issue) => {
      fields[issue.path[0]] = issue.message;
    });
    return next(new ValidationError('Invalid query parameters', fields));
  }
  next();
};
