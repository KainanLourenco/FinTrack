import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Budget, Category, FinancialGoal } from '../types';
import { Plus, Target, AlertCircle } from 'lucide-react';

export default function Planning() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);

  const [newBudget, setNewBudget] = useState({ category_id: '', amount_limit: '', period: new Date().toISOString().slice(0, 7) });
  const [newGoal, setNewGoal] = useState({ name: '', target_amount: '', deadline: '' });

  const fetchData = async () => {
    try {
      const [b, g, c] = await Promise.all([
        api.getBudgets(),
        api.getGoals(),
        api.getCategories(),
      ]);
      setBudgets(b);
      setGoals(g);
      setCategories(c);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createBudget({
        ...newBudget,
        category_id: parseInt(newBudget.category_id),
        amount_limit: parseFloat(newBudget.amount_limit),
      });
      setShowBudgetForm(false);
      fetchData();
    } catch (error) {
      alert('Erro ao criar orçamento');
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createGoal({
        ...newGoal,
        target_amount: parseFloat(newGoal.target_amount),
      });
      setShowGoalForm(false);
      fetchData();
    } catch (error) {
      alert('Erro ao criar meta');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Carregando...</div>;

  return (
    <div className="space-y-8">
      {/* Budgets Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-indigo-600" />
            Orçamentos Mensais
          </h2>
          <button
            onClick={() => setShowBudgetForm(!showBudgetForm)}
            className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 font-medium flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Novo
          </button>
        </div>

        {showBudgetForm && (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4 animate-in slide-in-from-top-2">
            <form onSubmit={handleCreateBudget} className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  value={newBudget.category_id}
                  onChange={(e) => setNewBudget({ ...newBudget, category_id: e.target.value })}
                >
                  <option value="">Selecione...</option>
                  {categories.filter(c => c.type === 'expense').map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs font-medium text-gray-700 mb-1">Limite (R$)</label>
                <input
                  type="number"
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  value={newBudget.amount_limit}
                  onChange={(e) => setNewBudget({ ...newBudget, amount_limit: e.target.value })}
                />
              </div>
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700">Salvar</button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((budget) => {
            const spent = budget.current_spent || 0;
            const percentage = Math.min((spent / budget.amount_limit) * 100, 100);
            const isOver = spent > budget.amount_limit;
            
            return (
              <div key={budget.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-gray-700">{budget.category_name}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{budget.period}</span>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className={isOver ? 'text-red-600 font-bold' : 'text-gray-600'}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(spent)}
                    </span>
                    <span className="text-gray-400">
                      / {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(budget.amount_limit)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${isOver ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                {isOver && <p className="text-xs text-red-500 font-medium mt-1">Orçamento estourado!</p>}
              </div>
            );
          })}
          {budgets.length === 0 && <p className="text-gray-500 text-sm col-span-full">Nenhum orçamento definido para este mês.</p>}
        </div>
      </section>

      {/* Goals Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-green-600" />
            Metas Financeiras
          </h2>
          <button
            onClick={() => setShowGoalForm(!showGoalForm)}
            className="text-sm bg-green-50 text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-100 font-medium flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Nova
          </button>
        </div>

        {showGoalForm && (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4 animate-in slide-in-from-top-2">
            <form onSubmit={handleCreateGoal} className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-medium text-gray-700 mb-1">Nome da Meta</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Viagem, Carro Novo"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs font-medium text-gray-700 mb-1">Valor Alvo (R$)</label>
                <input
                  type="number"
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  value={newGoal.target_amount}
                  onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs font-medium text-gray-700 mb-1">Prazo</label>
                <input
                  type="date"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                />
              </div>
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700">Salvar</button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
            return (
              <div key={goal.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <Target className="w-16 h-16 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{goal.name}</h3>
                <p className="text-xs text-gray-500 mb-3">
                  Prazo: {goal.deadline ? new Date(goal.deadline).toLocaleDateString('pt-BR') : 'Sem prazo'}
                </p>
                
                <div className="flex justify-between items-end mb-2">
                  <span className="text-2xl font-bold text-green-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.current_amount)}
                  </span>
                  <span className="text-xs text-gray-400 mb-1">
                    de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.target_amount)}
                  </span>
                </div>
                
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-green-500 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
          {goals.length === 0 && <p className="text-gray-500 text-sm col-span-full">Nenhuma meta definida.</p>}
        </div>
      </section>
    </div>
  );
}
