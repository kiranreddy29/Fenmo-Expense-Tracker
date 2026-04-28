const BASE_URL = 'http://localhost:4000/expenses';

export const fetchExpenses = async (category = '') => {
  const queryParams = new URLSearchParams();
  if (category && category !== 'All') {
    queryParams.append('category', category);
  }
  queryParams.append('sort', 'date_desc');

  const url = `${BASE_URL}?${queryParams.toString()}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch expenses');
  }
  
  return response.json();
};

export const createExpense = async (expenseData, idempotencyKey) => {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(expenseData),
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 400 || response.status === 409) {
      throw data.error; // Contains code, message, fields
    }
    throw new Error('An unexpected error occurred while saving.');
  }

  return data;
};
