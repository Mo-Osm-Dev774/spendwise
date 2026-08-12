import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Education',
  'Health',
  'Entertainment',
  'Other',
]

function Transactions() {
  const { user } = useAuth()

  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('expense')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterMonth, setFilterMonth] = useState('all')

  useEffect(() => {
    fetchTransactions()
  }, [])

  async function fetchTransactions() {
    setLoading(true)
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setTransactions(data)
    }
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Please enter a transaction title.')
      return
    }
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount.')
      return
    }

    setSaving(true)

    const { error } = await supabase.from('transactions').insert({
      user_id: user.id,
      title: title.trim(),
      amount: Number(amount),
      type,
      category,
      date,
      description: description.trim() || null,
    })

    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    setTitle('')
    setAmount('')
    setDescription('')
    fetchTransactions()
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) {
      setError(error.message)
      return
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase())
    const matchesType = filterType === 'all' || t.type === filterType
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory
    const matchesMonth =
      filterMonth === 'all' || String(new Date(t.date).getMonth() + 1) === filterMonth

    return matchesSearch && matchesType && matchesCategory && matchesMonth
  })

  const hasActiveFilters =
    search || filterType !== 'all' || filterCategory !== 'all' || filterMonth !== 'all'

  function clearFilters() {
    setSearch('')
    setFilterType('all')
    setFilterCategory('all')
    setFilterMonth('all')
  }

  const inputClass =
    'w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'

  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        Transactions
      </h1>

      {error && (
        <p className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg p-3 mb-4">
          {error}
        </p>
      )}

      {/* Add transaction form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <div className="sm:col-span-2">
          <label className={labelClass}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="e.g. Grocery shopping"
          />
        </div>

        <div>
          <label className={labelClass}>Amount</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputClass}
            placeholder="0.00"
          />
        </div>

        <div>
          <label className={labelClass}>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Description (optional)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass}
            placeholder="Add a note..."
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Add Transaction'}
          </button>
        </div>
      </form>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-6">
        <div className="mb-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inputClass}
            placeholder="Search transactions by title..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={`${inputClass} text-sm`}
          >
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={`${inputClass} text-sm`}
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className={`${inputClass} text-sm`}
          >
            <option value="all">All months</option>
            {[
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December',
            ].map((m, i) => (
              <option key={m} value={String(i + 1)}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mt-3"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Transaction list */}
      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading transactions...</p>
      ) : filteredTransactions.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          {hasActiveFilters
            ? 'No transactions match your search or filters.'
            : 'No transactions yet. Add your first one above.'}
        </p>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow divide-y divide-gray-100 dark:divide-gray-700">
          {filteredTransactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">{t.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.category} · {t.date}
                </p>
                {t.description && (
                  <p className="text-sm text-gray-400 dark:text-gray-500">{t.description}</p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`font-semibold ${
                    t.type === 'income'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {t.type === 'income' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                </span>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Transactions