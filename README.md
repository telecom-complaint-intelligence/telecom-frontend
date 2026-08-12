# telecom-frontend

Frontend for the Telecom Complaint Intelligence & Automated Resolution Assistant — Next.js dashboard for complaint tracking, sentiment/priority views, and the AI triage agent chat.

---

## 📁 Folder Structure

```
telecom-frontend/
├── public/          # static assets (images, favicon)
├── src/
│   ├── app/          # Next.js App Router — pages & routes
│   ├── components/   # reusable UI components
│   ├── lib/           # API client, utils, shared logic
│   ├── hooks/          # custom React hooks
│   ├── types/           # TypeScript types (match backend contract)
│   └── styles/           # global styles, Tailwind config
└── tests/            # component & e2e tests
```

**Rule of thumb — where code goes:**
| Type of code | Folder |
|---|---|
| New page/route | `src/app/<route-name>/page.tsx` |
| Reusable button, card, modal, table | `src/components/` |
| API call function, formatter, constants | `src/lib/` |
| Custom hook (`useX`) | `src/hooks/` |
| Shared TypeScript interface/type | `src/types/` |
| Global CSS / theme tokens | `src/styles/` |
| Test for a component/page | `tests/` (mirror the source path) |

Never put page-only logic inside `components/` — if it's used on exactly one page, keep it colocated inside that page's folder in `app/`. Only promote to `components/` once it's reused.

---

## Branching Strategy

```
main        → production-ready, protected, deploy-only
  └── dev   → integration branch, all features merge here first
       ├── feature/<yourname>-<short-feature-desc>
       ├── fix/<yourname>-<short-bug-desc>-<issue-number>
       └── chore/<yourname>-<short-task-desc>
```

**Branch naming convention:**

| Type | Format | Example |
|---|---|---|
| New feature | `feature/<name>-<feature>` | `feature/arun-complaint-table` |
| Bug fix | `fix/<name>-<feature>-<issue-number>` | `fix/priya-login-redirect-23` |
| Refactor / cleanup | `chore/<name>-<task>` | `chore/vaahee-lint-config` |
| Hotfix (urgent, off main) | `hotfix/<name>-<issue>` | `hotfix/arun-prod-crash` |

**Rules:**
- Never commit directly to `main` or `dev` — always via Pull Request.
- Branch off `dev`, not `main`, for all feature/fix work.
- One branch = one feature/fix. Don't bundle unrelated changes.
- `main` only receives merges from `dev` (or `hotfix/*` in emergencies).
- Delete your branch after it's merged.

### Flow

```
1. git checkout dev
2. git pull origin dev
3. git checkout -b feature/<name>-<feature>
4. ... code, commit ...
5. git push origin feature/<name>-<feature>
6. Open PR: feature/<name>-<feature> → dev
7. Get 1 review approval + CI passing
8. Merge → delete branch
9. Periodically: dev → main (when stable, via PR)
```

---

## 💻 Commands (run from repo root: `telecom-frontend/`)

### 🛠️ Installing `pnpm` (if not present)

You must install `pnpm` before setting up the project:

- **macOS/Linux**:
  ```bash
  curl -fsSL https://get.pnpm.io/install.sh | sh -
  # Or via Homebrew:
  brew install pnpm
  # Or via npm (if Node.js is already installed):
  npm install -g pnpm
  ```
- **Windows**:
  ```powershell
  iwr https://get.pnpm.io/install.ps1 -useb | iex
  # Or via winget:
  winget install StefanScherer.pnpm
  # Or via npm (if Node.js is already installed):
  npm install -g pnpm
  ```

*Restart your terminal after installation.*

### 🚀 Commands

```bash
# install dependencies
pnpm install

# run local dev server
pnpm dev            # http://localhost:3000

# lint
pnpm lint

# type-check
pnpm type-check

# build (production)
pnpm build

# run tests
pnpm test
```

> All commands run from the **repo root** — there is no separate `frontend/` sub-path in this repo, this repo IS the frontend.

---

## Before You Start Coding (after `git pull`)

- [ ] Confirm you're on the correct branch (`git branch` shows `feature/...`, not `dev`/`main`)
- [ ] Pulled latest `dev`: `git pull origin dev` (then rebase/merge into your branch if it already existed)
- [ ] `pnpm install` — in case dependencies changed since your last pull
- [ ] `.env.local` present and up to date (check `.env.example` for any new variables added by teammates)
- [ ] `pnpm dev` — confirm the app boots with no errors before touching code
- [ ] Check open PRs / issues board — make sure no one else is already working on the same page/component

---

## Before You Push

- [ ] `pnpm lint` — no lint errors
- [ ] `pnpm type-check` — no TypeScript errors
- [ ] `pnpm build` — production build succeeds (catches issues `dev` mode hides)
- [ ] `pnpm test` — all tests pass (add/update tests for what you changed)
- [ ] No console.log / debug code left in
- [ ] No secrets, API keys, or `.env` values hardcoded or committed
- [ ] Commit messages follow convention (see below)
- [ ] Branch is up to date with latest `dev` (`git merge origin/dev` or rebase) — resolve conflicts locally, not in the PR
- [ ] PR description filled: what changed, why, how you tested it, linked issue number

---

## Commit Message Convention

```
feat: add complaint priority badge to table
fix: resolve login redirect loop (#23)
chore: update eslint config
refactor: extract ComplaintCard from ComplaintTable
docs: update README setup steps
```

Format: `<type>: <short description>` — keep to one line, present tense, no period at the end.
