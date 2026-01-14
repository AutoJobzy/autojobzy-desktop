import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  PieChart,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface FinancialOverview {
  revenue: {
    total: number;
    daily: number;
    monthly: number;
  };
  expenses: {
    total: number;
    daily: number;
    monthly: number;
  };
  profit: {
    total: number;
    monthly: number;
  };
  subscriptions: {
    active: number;
    expired: number;
    cancelled: number;
  };
  planRevenue: Array<{
    plan_name: string;
    price: string;
    subscription_count: number;
    total_revenue: string;
  }>;
}

interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  notes: string;
  createdBy: string;
}

interface Transaction {
  id: string;
  amount: number;
  status: string;
  startDate: string;
  createdAt: string;
  User: {
    email: string;
    firstName: string;
    lastName: string;
  };
  plan: {
    name: string;
    price: string;
  };
}

const AdminMoneyManagement: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'overview' | 'expenses' | 'transactions' | 'profit-loss'>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Financial Overview Data
  const [overview, setOverview] = useState<FinancialOverview | null>(null);
  const [revenueTrends, setRevenueTrends] = useState<any[]>([]);
  const [profitLossData, setProfitLossData] = useState<any[]>([]);

  // Expenses Data
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Transactions Data
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionPagination, setTransactionPagination] = useState<any>(null);
  const [transactionPage, setTransactionPage] = useState(1);

  // Form Data
  const [expenseForm, setExpenseForm] = useState({
    category: 'server',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const getToken = () => localStorage.getItem('adminToken');

  const fetchFinancialOverview = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/money/overview`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch overview');

      const data = await response.json();
      setOverview(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueTrends = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/money/revenue-trends`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch trends');

      const data = await response.json();
      setRevenueTrends(data.trends || []);
    } catch (err: any) {
      console.error('Failed to load revenue trends:', err);
    }
  };

  const fetchProfitLoss = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/money/profit-loss`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch profit/loss');

      const data = await response.json();
      setProfitLossData(data.monthlyData || []);
    } catch (err: any) {
      console.error('Failed to load profit/loss data:', err);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/money/expenses`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch expenses');

      const data = await response.json();
      setExpenses(data.expenses || []);
      setCategoryBreakdown(data.categoryBreakdown || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load expenses');
    }
  };

  const fetchTransactions = async (page: number = 1) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/money/transactions?page=${page}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch transactions');

      const data = await response.json();
      setTransactions(data.transactions || []);
      setTransactionPagination(data.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingExpense
        ? `${API_BASE_URL}/admin/money/expenses/${editingExpense.id}`
        : `${API_BASE_URL}/admin/money/expenses`;

      const method = editingExpense ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify(expenseForm),
      });

      if (!response.ok) throw new Error('Failed to save expense');

      await fetchExpenses();
      await fetchFinancialOverview();
      setShowExpenseModal(false);
      setEditingExpense(null);
      setExpenseForm({
        category: 'server',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    } catch (err: any) {
      alert(err.message || 'Failed to save expense');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/money/expenses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete expense');

      await fetchExpenses();
      await fetchFinancialOverview();
    } catch (err: any) {
      alert(err.message || 'Failed to delete expense');
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      category: expense.category,
      amount: expense.amount.toString(),
      date: expense.date,
      notes: expense.notes || '',
    });
    setShowExpenseModal(true);
  };

  useEffect(() => {
    fetchFinancialOverview();
    fetchRevenueTrends();
    fetchProfitLoss();
    fetchExpenses();
    fetchTransactions();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#06b6d4'];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Money Management</h1>
        <p className="text-gray-400">Complete financial overview and tracking</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex gap-4 mb-6 border-b border-white/10">
        <button
          onClick={() => setActiveSection('overview')}
          className={`px-4 py-2 font-medium transition-all ${activeSection === 'overview'
            ? 'text-white border-b-2 border-red-500'
            : 'text-gray-400 hover:text-white'
            }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveSection('expenses')}
          className={`px-4 py-2 font-medium transition-all ${activeSection === 'expenses'
            ? 'text-white border-b-2 border-red-500'
            : 'text-gray-400 hover:text-white'
            }`}
        >
          Expenses
        </button>
        <button
          onClick={() => setActiveSection('transactions')}
          className={`px-4 py-2 font-medium transition-all ${activeSection === 'transactions'
            ? 'text-white border-b-2 border-red-500'
            : 'text-gray-400 hover:text-white'
            }`}
        >
          Transactions
        </button>
        <button
          onClick={() => setActiveSection('profit-loss')}
          className={`px-4 py-2 font-medium transition-all ${activeSection === 'profit-loss'
            ? 'text-white border-b-2 border-red-500'
            : 'text-gray-400 hover:text-white'
            }`}
        >
          Profit & Loss
        </button>
      </div>

      {/* OVERVIEW SECTION */}
      {activeSection === 'overview' && overview && (
        <div className="space-y-6">
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Revenue */}
            <div className="bg-dark-800 border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-gray-400 text-sm mb-1">Total Revenue</h3>
              <p className="text-2xl font-bold text-white">{formatCurrency(overview.revenue.total)}</p>
              <p className="text-xs text-gray-500 mt-2">
                Daily: {formatCurrency(overview.revenue.daily)}
              </p>
            </div>

            {/* Total Expenses */}
            <div className="bg-dark-800 border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-red-500" />
                </div>
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-gray-400 text-sm mb-1">Total Expenses</h3>
              <p className="text-2xl font-bold text-white">{formatCurrency(overview.expenses.total)}</p>
              <p className="text-xs text-gray-500 mt-2">
                Daily: {formatCurrency(overview.expenses.daily)}
              </p>
            </div>

            {/* Net Profit */}
            <div className="bg-dark-800 border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${overview.profit.total >= 0 ? 'bg-blue-500/10' : 'bg-orange-500/10'} rounded-lg flex items-center justify-center`}>
                  <TrendingUp className={`w-6 h-6 ${overview.profit.total >= 0 ? 'text-blue-500' : 'text-orange-500'}`} />
                </div>
                {overview.profit.total >= 0 ? (
                  <ArrowUpRight className="w-5 h-5 text-green-500" />
                ) : (
                  <ArrowDownRight className="w-5 h-5 text-red-500" />
                )}
              </div>
              <h3 className="text-gray-400 text-sm mb-1">Net Profit</h3>
              <p className={`text-2xl font-bold ${overview.profit.total >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(overview.profit.total)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Monthly: {formatCurrency(overview.profit.monthly)}
              </p>
            </div>

            {/* Active Subscriptions */}
            <div className="bg-dark-800 border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-purple-500" />
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-gray-400 text-sm mb-1">Active Subscriptions</h3>
              <p className="text-2xl font-bold text-white">{overview.subscriptions.active}</p>
              <div className="flex gap-4 text-xs text-gray-500 mt-2">
                <span>Expired: {overview.subscriptions.expired}</span>
                <span>Cancelled: {overview.subscriptions.cancelled}</span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trends Chart */}
            <div className="bg-dark-800 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Revenue Trends (12 Months)</h3>
              {revenueTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} name="Revenue" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No revenue data available
                </div>
              )}
            </div>

            {/* Plan-wise Revenue Pie Chart */}
            <div className="bg-dark-800 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Revenue by Plan</h3>
              {overview.planRevenue.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={overview.planRevenue}
                      dataKey="total_revenue"
                      nameKey="plan_name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => `${entry.plan_name}: ${formatCurrency(parseFloat(entry.total_revenue || '0'))}`}
                    >
                      {overview.planRevenue.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                      formatter={(value: any) => formatCurrency(parseFloat(value || '0'))}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No plan revenue data available
                </div>
              )}
            </div>
          </div>

          {/* Subscription Stats */}
          <div className="bg-dark-800 border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Subscription Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {overview.planRevenue.map((plan, index) => (
                <div key={index} className="bg-dark-900 rounded-lg p-4 border border-white/5">
                  <h4 className="text-white font-medium mb-2">{plan.plan_name}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Price:</span>
                      <span className="text-white">{plan.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Active Subs:</span>
                      <span className="text-white">{plan.subscription_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Revenue:</span>
                      <span className="text-green-500 font-semibold">
                        {formatCurrency(parseFloat(plan.total_revenue || '0'))}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EXPENSES SECTION */}
      {activeSection === 'expenses' && (
        <div className="space-y-6">
          {/* Expense Header with Add Button */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Expense Management</h2>
            <button
              onClick={() => {
                setEditingExpense(null);
                setExpenseForm({
                  category: 'server',
                  amount: '',
                  date: new Date().toISOString().split('T')[0],
                  notes: '',
                });
                setShowExpenseModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          </div>

          {/* Expense Category Breakdown */}
          {categoryBreakdown.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Breakdown Table */}
              <div className="bg-dark-800 border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Category Breakdown</h3>
                <div className="space-y-3">
                  {categoryBreakdown.map((cat: any, index: number) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-gray-300 capitalize">{cat.category}</span>
                        <span className="text-xs text-gray-500">({cat.count} expenses)</span>
                      </div>
                      <span className="text-white font-semibold">{formatCurrency(parseFloat(cat.total || '0'))}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expense Pie Chart */}
              <div className="bg-dark-800 border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Expense Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={categoryBreakdown}
                      dataKey="total"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => `${entry.category}: ${formatCurrency(parseFloat(entry.total || '0'))}`}
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                      formatter={(value: any) => formatCurrency(parseFloat(value || '0'))}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Expenses Table */}
          <div className="bg-dark-800 border border-white/10 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Notes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">
                        {expense.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">
                        {expense.notes || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {expense.createdBy || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditExpense(expense)}
                            className="text-blue-500 hover:text-blue-400"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="text-red-500 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {expenses.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No expenses recorded yet
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TRANSACTIONS SECTION */}
      {activeSection === 'transactions' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Payment Transactions</h2>

          {/* Transactions Table */}
          <div className="bg-dark-800 border border-white/10 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div>
                          <div className="font-medium text-white">
                            {transaction.User.firstName} {transaction.User.lastName}
                          </div>
                          <div className="text-xs text-gray-500">{transaction.User.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {transaction.plan.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${transaction.status === 'active'
                            ? 'bg-green-500/10 text-green-500'
                            : transaction.status === 'expired'
                              ? 'bg-yellow-500/10 text-yellow-500'
                              : transaction.status === 'cancelled'
                                ? 'bg-red-500/10 text-red-500'
                                : 'bg-gray-500/10 text-gray-500'
                            }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {transaction.status === 'active' && (
                          <button
                            className="text-red-500 hover:text-red-400 text-xs"
                            onClick={() => {
                              if (confirm('Mark this transaction as refunded?')) {
                                // Handle refund
                              }
                            }}
                          >
                            Mark Refunded
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {transactionPagination && (
              <div className="px-6 py-4 bg-dark-900 flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Showing {((transactionPagination.page - 1) * transactionPagination.limit) + 1} to{' '}
                  {Math.min(transactionPagination.page * transactionPagination.limit, transactionPagination.total)} of{' '}
                  {transactionPagination.total} transactions
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (transactionPage > 1) {
                        setTransactionPage(transactionPage - 1);
                        fetchTransactions(transactionPage - 1);
                      }
                    }}
                    disabled={transactionPage === 1}
                    className="px-3 py-1 bg-dark-800 text-gray-400 rounded hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => {
                      if (transactionPage < transactionPagination.totalPages) {
                        setTransactionPage(transactionPage + 1);
                        fetchTransactions(transactionPage + 1);
                      }
                    }}
                    disabled={transactionPage >= transactionPagination.totalPages}
                    className="px-3 py-1 bg-dark-800 text-gray-400 rounded hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PROFIT & LOSS SECTION */}
      {activeSection === 'profit-loss' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Profit & Loss Report (12 Months)</h2>

          {/* P&L Chart */}
          <div className="bg-dark-800 border border-white/10 rounded-lg p-6">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={profitLossData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value: any) => formatCurrency(parseFloat(value || '0'))}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#22c55e" name="Revenue" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                <Bar dataKey="profit" fill="#3b82f6" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Breakdown Table */}
          <div className="bg-dark-800 border border-white/10 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Month</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Expenses</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Profit/Loss</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {profitLossData.map((row: any, index: number) => (
                    <tr key={index} className="hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{row.month}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-500 font-semibold">
                        {formatCurrency(parseFloat(row.revenue || '0'))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-500 font-semibold">
                        {formatCurrency(parseFloat(row.expenses || '0'))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold">
                        <span className={parseFloat(row.profit || '0') >= 0 ? 'text-blue-500' : 'text-orange-500'}>
                          {formatCurrency(parseFloat(row.profit || '0'))}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-white/10 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                {editingExpense ? 'Edit Expense' : 'Add New Expense'}
              </h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-gray-400 hover:text-white">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full bg-dark-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-red-500 focus:outline-none"
                  required
                >
                  <option value="server">Server / Cloud</option>
                  <option value="api">API / AI Usage</option>
                  <option value="email">Email Service</option>
                  <option value="support">Support / Operations</option>
                  <option value="marketing">Marketing / Ads</option>
                  <option value="operations">General Operations</option>
                  <option value="miscellaneous">Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="w-full bg-dark-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-red-500 focus:outline-none"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="w-full bg-dark-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-red-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes (Optional)</label>
                <textarea
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                  className="w-full bg-dark-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-red-500 focus:outline-none"
                  placeholder="Additional details about this expense..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="flex-1 px-4 py-2 bg-dark-900 text-gray-300 rounded-lg hover:bg-dark-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  {editingExpense ? 'Update' : 'Create'} Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMoneyManagement;
