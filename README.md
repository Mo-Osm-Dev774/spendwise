# SpendWise 💰

**Personal Expense & Budget Tracker**

SpendWise is a web application that helps users easily manage their money, track expenses, and stay on top of their monthly budget. Built as a final capstone project with a focus on both a working product and a clean, professional Git/GitHub workflow.

---

## Features

- 🔐 **Authentication** — Register, login, logout, and protected dashboard routes via Supabase Auth
- 💵 **Transactions** — Add, view, edit, and delete income & expense transactions
- 🏷️ **Categories** — Organize expenses (Food, Transport, Shopping, Bills, Education, Health, Entertainment, Other)
- 📊 **Budget Management** — Set a monthly budget, track amount spent, remaining budget, and get warnings as you approach the limit
- 📈 **Analytics** — Visualize Income vs Expenses, spending by category, and monthly trends with charts
- 🔍 **Search & Filters** — Search transactions and filter by type, category, or date/month
- 🔒 **Row Level Security** — Every user can only see and manage their own data

---

## Tech Stack

**Frontend**
- React + Vite
- Tailwind CSS
- React Router
- Recharts

**Backend / Database**
- Supabase (PostgreSQL)
- Supabase Authentication
- Row Level Security (RLS)

**Tooling**
- Git & GitHub
- GitHub Actions (CI/CD)

---

## Installation

1. Clone the repository
   ```bash
   git clone https://github.com/Mo-Osm-Dev774/spendwise
   cd spendwise
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables (see below)

4. Run the development server
   ```bash
   npm run dev
   ```

---

## Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> ⚠️ Never commit your `.env` file. It's already excluded via `.gitignore`.

---

## Database Structure

**Tables**

- `profiles` — id, full_name, email, avatar_url, created_at
- `transactions` — id, user_id, title, amount, type, category, description, date, created_at, updated_at
- `budgets` — id, user_id, amount, month, year, created_at, updated_at

Each `user_id` links a table row to the authenticated user, and Row Level Security ensures users can only access their own records.

---

## Project Structure

```
spendwise/
├── .github/workflows/ci.yml
├── src/
│   ├── components/
│   ├── pages/
│   ├── lib/
│   │   └── supabase.js
│   ├── hooks/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── .gitignore
└── package.json
```

---

## GitHub Actions

A CI workflow (`.github/workflows/ci.yml`) runs on every push:

```bash
npm install
npm run build
```

This ensures the project always builds successfully before changes are merged.

---

## Git Workflow

This project follows a feature-branch workflow:

```
feature branch → commit → push → Pull Request → review → merge
```

- New features are developed on dedicated branches (e.g. `feature/authentication`, `feature/transactions`)
- No direct pushes to `main`
- Every Pull Request includes a description of what changed and why
- At least one review comment is added before merging

---

## Screenshots

_Coming soon._

---

## Author

Mohamed Osman — Final Capstone Project
GitHub: [@Mo-Osm-Dev774](https://github.com/Mo-Osm-Dev774)