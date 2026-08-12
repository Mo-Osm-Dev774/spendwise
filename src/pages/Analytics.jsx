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
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains('dark')
  )

  useEffect(() => {
    fetchTransactions()

    // Watch for theme changes so charts update without a page reload
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
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

  // Colors that actually apply to Recharts SVG text/lines
  const axisColor = isDark ? '#d1d5db' : '#4b5563' // gray-300 / gray-600
  const gridColor = isDark ? '#374151' : '#e5e7eb' // gray-700 / gray-200
  const legendColor = isDark ? '#e5e7eb' : '#374151'
  const tooltipStyle = {
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    border: 'none',
    borderRadius: 8,
    color: isDark ? '#f3f4f6' : '#111827',
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        Analytics
      </h1>

      {error && (
        <p className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg p-3 mb-4">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading analytics...</p>
      ) : transactions.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          No transactions yet. Add some transactions to see your analytics.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Income vs Expenses
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={incomeVsExpenseData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" tick={{ fill: axisColor }} axisLine={{ stroke: gridColor }} />
                <YAxis tick={{ fill: axisColor }} axisLine={{ stroke: gridColor }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {categoryData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
              <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Expenses by Category
              </h2>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={{ fill: axisColor }}
                  >
                    {categoryData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ color: legendColor }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Monthly Spending ({currentYear})
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" tick={{ fill: axisColor }} axisLine={{ stroke: gridColor }} />
                <YAxis tick={{ fill: axisColor }} axisLine={{ stroke: gridColor }} />
                <Tooltip contentStyle={tooltipStyle} />
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