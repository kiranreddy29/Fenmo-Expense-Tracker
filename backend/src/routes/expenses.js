import express from 'express';
import expenseService from '../services/expenseService.js';
import { validateCreateExpense, validateListQuery } from '../validators/expenseValidator.js';

const router = express.Router();

/**
 * @openapi
 * /expenses:
 *   post:
 *     summary: Create a new expense
 *     parameters:
 *       - in: header
 *         name: Idempotency-Key
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, category, description, date]
 *             properties:
 *               amount: { type: string, example: "250.00" }
 *               category: { type: string, example: "Food" }
 *               description: { type: string, example: "Lunch" }
 *               date: { type: string, example: "2026-04-28" }
 *     responses:
 *       201: { description: Created }
 *       200: { description: Idempotent Replay }
 *       400: { description: Bad Request }
 *       409: { description: Conflict }
 */
router.post('/', validateCreateExpense, (req, res, next) => {
  try {
    const idempotencyKey = req.headers['idempotency-key'];
    const expense = expenseService.createExpense(req.body, idempotencyKey);
    
    if (expense.idempotent_replay) {
      return res.status(200).json(expense);
    }
    
    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /expenses:
 *   get:
 *     summary: Get all expenses
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [date_desc] }
 *     responses:
 *       200: { description: Success }
 */
router.get('/', validateListQuery, (req, res, next) => {
  try {
    const results = expenseService.getExpenses(req.query);
    res.json(results);
  } catch (error) {
    next(error);
  }
});

export default router;
