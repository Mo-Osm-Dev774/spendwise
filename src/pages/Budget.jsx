import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function Budget() {
  const { user } = useAuth()

  const now = new Date()
  const [month] = useState(now.getMonth() + 1)
  const [year] = useState(now.getFullYear())

  const [budget, setBudget] = useState(null)
  const [spent, setSpent] = useState(0)
  const [amountInput, setAmountInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadBudgetData()
  }, [])

  async function loadBudgetData() {
    setLoading(true)
    setError('')

    const { data: budgetData, error: budgetError } = await supabase
      .from('budgets')
      .select('*')
      .eq('month', month)
      .eq('year', year)
      .maybeSingle()

    if (budgetError) {
      setError(budgetError.message)
    } else if (budgetData) {
      setBudget(budgetData)
      setAmountInput(budgetData.amount)
    }

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endMonth = month === 12 ? 1 : month + 1
    const endYear = month === 12 ? year + 1 : year
    const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`

    const { data: expenseData, error: expenseError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('type', 'expense')
      .gte('date', startDate)
      .lt('date', endDate)

    if (expenseError) {
      setError(expenseError.message)
    } else {
      const total = expenseData.reduce((sum, t) => sum + Number(t.amount), 0)
      setSpent(total)
    }

    setLoading(false)
  }

  async function handleSave(e) {
    e.preventDefault()
    setError('')

    if (!amountInput || Number(amountInput) <= 0) {
      setError('Please enter a valid budget amount.')
      return
    }

    setSaving(true)

    if (budget) {
      const { error } = await supabase
        .from('budgets')
        .update({ amount: Number(amountInput), updated_at: new Date().toISOString() })
        .eq('id', budget.id)

      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }
    } else {
      const { error } = await supabase.from('budgets').insert({
        user_id: user.id,
        amount: Number(amountInput),
        month,
        year,
      })

      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }
    }

    setSaving(false)
    loadBudgetData()
  }

  const budgetAmount = budget ? Number(budget.amount) : 0
  const remaining = budgetAmount - spent
  const percentUsed = budgetAmount > 0 ? Math.min((spent / budgetAmount) * 100, 100) : 0
  const isNearLimit = percentUsed >= 80 && percentUsed < 100
  const isOverBudget = spent > budgetAmount && budgetAmount > 0

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        Budget — {MONTHS[month - 1]} {year}
      </h1>

      {error && (
        <p className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg p-3 mb-4">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading budget...</p>
      ) : (
        <>
          <form
            onSubmit={handleSave}
            className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-6 flex items-end gap-4"
          >
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Monthly Budget
              </label>
              <input
                type="number"
                step="0.01"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. 500"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : budget ? 'Update' : 'Set Budget'}
            </button>
          </form>

          {budget && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Budget</p>
                  <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    ${budgetAmount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Spent</p>
                  <p className="text-xl font-semibold text-red-600 dark:text-red-400">
                    ${spent.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Remaining</p>
                  <p
                    className={`text-xl font-semibold ${
                      remaining < 0
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-green-600 dark:text-green-400'
                    }`}
                  >
                    ${remaining.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all ${
                    isOverBudget
                      ? 'bg-red-600'
                      : isNearLimit
                      ? 'bg-yellow-500'
                      : 'bg-indigo-600'
                  }`}
                  style={{ width: `${percentUsed}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                {percentUsed.toFixed(0)}% used
              </p>

              {isOverBudget && (
                <p className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg p-3 mt-4">
                  ⚠️ You've exceeded your budget for this month.
                </p>
              )}
              {isNearLimit && !isOverBudget && (
                <p className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-sm rounded-lg p-3 mt-4">
                  ⚠️ You're close to your budget limit for this month.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Budget