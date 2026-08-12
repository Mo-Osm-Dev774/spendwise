import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function Dashboard() {
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [remainingBudget, setRemainingBudget] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    setLoading(true)
    setError('')

    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('amount, type, date')

    if (txError) {
      setError(txError.message)
      setLoading(false)
      return
    }

    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    setTotalIncome(income)
    setTotalExpenses(expenses)

    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()

    const { data: budget, error: budgetError } = await supabase
      .from('budgets')
      .select('amount')
      .eq('month', month)
      .eq('year', year)
      .maybeSingle()

    if (budgetError) {
      setError(budgetError.message)
    } else if (budget) {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`
      const endMonth = month === 12 ? 1 : month + 1
      const endYear = month === 12 ? year + 1 : year
      const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`

      const monthExpenses = transactions
        .filter((t) => t.type === 'expense' && t.date >= startDate && t.date < endDate)
        .reduce((sum, t) => sum + Number(t.amount), 0)

      setRemainingBudget(Number(budget.amount) - monthExpenses)
    }

    setLoading(false)
  }

  const totalBalance = totalIncome - totalExpenses

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        Dashboard
      </h1>

      {error && (
        <p className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg p-3 mb-4">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Balance</p>
            <p
              className={`text-2xl font-semibold ${
                totalBalance < 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-800 dark:text-gray-100'
              }`}
            >
              ${totalBalance.toFixed(2)}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Income</p>
            <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
              ${totalIncome.toFixed(2)}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
            <p className="text-2xl font-semibold text-red-600 dark:text-red-400">
              ${totalExpenses.toFixed(2)}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Remaining Budget</p>
            <p className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              {remainingBudget === null
                ? 'No budget set'
                : `$${remainingBudget.toFixed(2)}`}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard