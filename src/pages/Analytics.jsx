import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts'
import { supabase } from '../lib/supabase'

const CATEGORY_COLORS = [
  '#6366f1', '#22c55e', '#ef4444', '#f59e0b',
  '#06b6d4', '#a855f7', '#ec4899', '#84cc16',
]

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

function Analytics() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTransactions()
  }, [])

  async function fetchTransactions() {
    setLoading(true)
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: true })

    if (error) {
      setError(error.message)
    } else {
      setTransactions(data)
    }
    setLoading(false)
  }

  // Income vs Expenses totals
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const incomeVsExpenseData = [
    { name: 'Income', amount: totalIncome },
    { name: 'Expenses', amount: totalExpenses },
  ]

  // Expenses by category
  const categoryTotals = {}
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount)
    })

  const categoryData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
  }))

  // Monthly spending (current year)
  const currentYear = new Date().getFullYear()
  const monthlyTotals = Array(12).fill(0)

  transactions
    .filter((t) => t.type === 'expense' && new Date(t.date).getFullYear() === currentYear)
    .forEach((t) => {
      const monthIndex = new Date(t.date).getMonth()
      monthlyTotals[monthIndex] += Number(t.amount)
    })

  const monthlyData = MONTHS.map((name, i) => ({
    name,
    amount: monthlyTotals[i],
  }))

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      {error && (
        <p className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-gray-500">Loading analytics...</p>
      ) : transactions.length === 0 ? (
        <p className="text-gray-500">
          No transactions yet. Add some transactions to see your analytics.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Income vs Expenses */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="font-semibold text-gray-800 mb-4">Income vs Expenses</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={incomeVsExpenseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Expenses by Category */}
          {categoryData.length > 0 && (
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="font-semibold text-gray-800 mb-4">Expenses by Category</h2>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(entry) => entry.name}
                  >
                    {categoryData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Monthly Spending */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="font-semibold text-gray-800 mb-4">
              Monthly Spending ({currentYear})
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

export default Analytics