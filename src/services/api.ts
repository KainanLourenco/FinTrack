const API_URL = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  async login(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  async register(name: string, email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) throw new Error('Registration failed');
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_URL}/auth/me`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  async getSummary() {
    const res = await fetch(`${API_URL}/summary`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch summary');
    return res.json();
  },

  async getTransactions() {
    const res = await fetch(`${API_URL}/transactions`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },

  async createTransaction(data: any) {
    const res = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create transaction');
    return res.json();
  },

  async getAccounts() {
    const res = await fetch(`${API_URL}/accounts`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch accounts');
    return res.json();
  },

  async createAccount(data: any) {
    const res = await fetch(`${API_URL}/accounts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create account');
    return res.json();
  },

  async getCategories() {
    const res = await fetch(`${API_URL}/categories`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async getBudgets(period?: string) {
    const query = period ? `?period=${period}` : '';
    const res = await fetch(`${API_URL}/budgets${query}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch budgets');
    return res.json();
  },

  async createBudget(data: any) {
    const res = await fetch(`${API_URL}/budgets`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create budget');
    return res.json();
  },

  async getGoals() {
    const res = await fetch(`${API_URL}/goals`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch goals');
    return res.json();
  },

  async createGoal(data: any) {
    const res = await fetch(`${API_URL}/goals`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create goal');
    return res.json();
  },
};
