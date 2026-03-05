import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Account } from '../types';
import { CreditCard, Wallet, Plus } from 'lucide-react';

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: '', type: 'checking', balance: 0 });

  const fetchAccounts = async () => {
    try {
      const data = await api.getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAccount(newAccount);
      setShowForm(false);
      setNewAccount({ name: '', type: 'checking', balance: 0 });
      fetchAccounts();
    } catch (error) {
      alert('Erro ao criar conta');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Contas</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Conta
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-6 animate-in slide-in-from-top-4">
          <h2 className="text-lg font-semibold mb-4">Adicionar Conta</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                value={newAccount.name}
                onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                value={newAccount.type}
                onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value as any })}
              >
                <option value="checking">Conta Corrente</option>
                <option value="savings">Poupança</option>
                <option value="credit">Cartão de Crédito</option>
                <option value="cash">Dinheiro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Saldo Inicial</label>
              <input
                type="number"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                value={newAccount.balance}
                onChange={(e) => setNewAccount({ ...newAccount, balance: parseFloat(e.target.value) })}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <div key={account.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-full ${
                account.type === 'credit' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
              }`}>
                {account.type === 'credit' ? <CreditCard className="w-6 h-6" /> : <Wallet className="w-6 h-6" />}
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100 px-2 py-1 rounded">
                {account.type === 'checking' ? 'Corrente' : 
                 account.type === 'savings' ? 'Poupança' : 
                 account.type === 'credit' ? 'Crédito' : 'Dinheiro'}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{account.name}</h3>
            <p className={`text-2xl font-bold mt-2 ${account.balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(account.balance)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
