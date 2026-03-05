import express from 'express';
import Database from 'better-sqlite3';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { createServer as createViteServer } from 'vite';
import path from 'path';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';

// Database Setup
const db = new Database('finance.db');
db.pragma('journal_mode = WAL');

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'checking', 'savings', 'credit', 'cash'
    balance REAL DEFAULT 0,
    currency TEXT DEFAULT 'BRL',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'income', 'expense'
    icon TEXT,
    color TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    category_id INTEGER,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- 'income', 'expense', 'transfer'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(account_id) REFERENCES accounts(id),
    FOREIGN KEY(category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category_id INTEGER,
    amount_limit REAL NOT NULL,
    period TEXT NOT NULL, -- 'YYYY-MM'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(category_id) REFERENCES categories(id),
    UNIQUE(user_id, category_id, period)
  );

  CREATE TABLE IF NOT EXISTS financial_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    target_amount REAL NOT NULL,
    current_amount REAL DEFAULT 0,
    deadline TEXT,
    status TEXT DEFAULT 'in_progress', -- 'in_progress', 'completed', 'paused'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Middleware
app.use(cors());
app.use(express.json());

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- API Routes ---

// Auth
app.post('/api/auth/register', async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
  });

  try {
    const { email, password, name } = schema.parse(req.body);
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const stmt = db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)');
    const info = stmt.run(email, hashedPassword, name);
    
    const token = jwt.sign({ id: info.lastInsertRowid, email }, JWT_SECRET, { expiresIn: '7d' });
    
    // Create default categories
    const userId = info.lastInsertRowid;
    const defaultCategories = [
      { name: 'Salário', type: 'income', icon: 'briefcase', color: 'green' },
      { name: 'Alimentação', type: 'expense', icon: 'utensils', color: 'orange' },
      { name: 'Transporte', type: 'expense', icon: 'car', color: 'blue' },
      { name: 'Moradia', type: 'expense', icon: 'home', color: 'purple' },
      { name: 'Lazer', type: 'expense', icon: 'smile', color: 'yellow' },
    ];
    
    const catStmt = db.prepare('INSERT INTO categories (user_id, name, type, icon, color) VALUES (?, ?, ?, ?, ?)');
    defaultCategories.forEach(cat => catStmt.run(userId, cat.name, cat.type, cat.icon, cat.color));

    // Create default account
    const accStmt = db.prepare('INSERT INTO accounts (user_id, name, type, balance) VALUES (?, ?, ?, ?)');
    accStmt.run(userId, 'Conta Principal', 'checking', 0);

    res.json({ token, user: { id: userId, email, name } });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

app.get('/api/auth/me', authenticateToken, (req: any, res) => {
  const user = db.prepare('SELECT id, email, name FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

// Accounts
app.get('/api/accounts', authenticateToken, (req: any, res) => {
  const accounts = db.prepare('SELECT * FROM accounts WHERE user_id = ?').all(req.user.id);
  res.json(accounts);
});

app.post('/api/accounts', authenticateToken, (req: any, res) => {
  const { name, type, balance } = req.body;
  const stmt = db.prepare('INSERT INTO accounts (user_id, name, type, balance) VALUES (?, ?, ?, ?)');
  const info = stmt.run(req.user.id, name, type, balance || 0);
  res.json({ id: info.lastInsertRowid, ...req.body });
});

// Categories
app.get('/api/categories', authenticateToken, (req: any, res) => {
  const categories = db.prepare('SELECT * FROM categories WHERE user_id = ?').all(req.user.id);
  res.json(categories);
});

app.post('/api/categories', authenticateToken, (req: any, res) => {
  const { name, type, icon, color } = req.body;
  const stmt = db.prepare('INSERT INTO categories (user_id, name, type, icon, color) VALUES (?, ?, ?, ?, ?)');
  const info = stmt.run(req.user.id, name, type, icon, color);
  res.json({ id: info.lastInsertRowid, ...req.body });
});

// Transactions
app.get('/api/transactions', authenticateToken, (req: any, res) => {
  const transactions = db.prepare(`
    SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color, a.name as account_name 
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    JOIN accounts a ON t.account_id = a.id
    WHERE t.user_id = ?
    ORDER BY t.date DESC, t.created_at DESC
  `).all(req.user.id);
  res.json(transactions);
});

app.post('/api/transactions', authenticateToken, (req: any, res) => {
  const schema = z.object({
    account_id: z.number(),
    category_id: z.number().optional(),
    amount: z.number(),
    date: z.string(),
    description: z.string().optional(),
    type: z.enum(['income', 'expense', 'transfer']),
  });

  try {
    const data = schema.parse(req.body);
    
    const stmt = db.prepare(`
      INSERT INTO transactions (user_id, account_id, category_id, amount, date, description, type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const info = stmt.run(
      req.user.id,
      data.account_id,
      data.category_id || null,
      data.amount,
      data.date,
      data.description || '',
      data.type
    );

    // Update account balance
    let balanceChange = data.amount;
    if (data.type === 'expense') balanceChange = -data.amount;
    
    // For transfer, logic would be more complex (source/dest), keeping simple for MVP: just update one account
    // In a real app, transfer needs source_account_id and dest_account_id
    
    db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(balanceChange, data.account_id);

    res.json({ id: info.lastInsertRowid, ...data });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Budgets
app.get('/api/budgets', authenticateToken, (req: any, res) => {
  const { period } = req.query;
  const budgets = db.prepare(`
    SELECT b.*, c.name as category_name, c.color as category_color,
    (SELECT SUM(amount) FROM transactions t 
     WHERE t.user_id = b.user_id 
     AND t.category_id = b.category_id 
     AND strftime('%Y-%m', t.date) = b.period
     AND t.type = 'expense') as current_spent
    FROM budgets b
    LEFT JOIN categories c ON b.category_id = c.id
    WHERE b.user_id = ? AND b.period = ?
  `).all(req.user.id, period || new Date().toISOString().slice(0, 7));
  res.json(budgets);
});

app.post('/api/budgets', authenticateToken, (req: any, res) => {
  const { category_id, amount_limit, period } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO budgets (user_id, category_id, amount_limit, period) VALUES (?, ?, ?, ?)');
    const info = stmt.run(req.user.id, category_id, amount_limit, period);
    res.json({ id: info.lastInsertRowid, ...req.body });
  } catch (error: any) {
    res.status(400).json({ error: 'Budget already exists for this category/period' });
  }
});

// Financial Goals
app.get('/api/goals', authenticateToken, (req: any, res) => {
  const goals = db.prepare('SELECT * FROM financial_goals WHERE user_id = ?').all(req.user.id);
  res.json(goals);
});

app.post('/api/goals', authenticateToken, (req: any, res) => {
  const { name, target_amount, deadline } = req.body;
  const stmt = db.prepare('INSERT INTO financial_goals (user_id, name, target_amount, deadline) VALUES (?, ?, ?, ?)');
  const info = stmt.run(req.user.id, name, target_amount, deadline);
  res.json({ id: info.lastInsertRowid, ...req.body });
});

// Summary (Dashboard)
app.get('/api/summary', authenticateToken, (req: any, res) => {
  const userId = req.user.id;
  
  // Total Balance
  const accounts = db.prepare('SELECT SUM(balance) as total FROM accounts WHERE user_id = ?').get(userId) as any;
  
  // Income vs Expense (Current Month)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const income = db.prepare(`
    SELECT SUM(amount) as total FROM transactions 
    WHERE user_id = ? AND type = 'income' AND date BETWEEN ? AND ?
  `).get(userId, startOfMonth, endOfMonth) as any;
  
  const expense = db.prepare(`
    SELECT SUM(amount) as total FROM transactions 
    WHERE user_id = ? AND type = 'expense' AND date BETWEEN ? AND ?
  `).get(userId, startOfMonth, endOfMonth) as any;

  // Recent Transactions
  const recent = db.prepare(`
    SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = ?
    ORDER BY t.date DESC, t.created_at DESC
    LIMIT 5
  `).all(userId);

  res.json({
    totalBalance: accounts?.total || 0,
    monthlyIncome: income?.total || 0,
    monthlyExpense: expense?.total || 0,
    recentTransactions: recent
  });
});

// Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    // app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
