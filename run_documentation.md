# Project Execution Guide

This document describes how to set up and run the different services of the Telu Telecom Triage application (Frontend, Backend, AI Service, and Docker services).

---

## 🛠️ Prerequisites
Ensure you have the following installed:
* **Node.js** (v18+) & **npm** or **pnpm**
* **uv** (fast Python package manager)
* **Docker** & **Docker Compose**

---

## 🐳 1. Docker (Databases & Cache)
The backend requires PostgreSQL (with `pgvector` extension) and Redis.

* **Start Services (Detached Mode)**:
  Run from the `telecom-backend/` directory:
  ```bash
  docker compose up -d
  ```
* **Verify running containers**:
  ```bash
  docker compose ps
  ```
* **Stop Services**:
  ```bash
  docker compose down
  ```

---

## 📡 2. Backend Service (`telecom-backend`)
Provides the main API, business logic, database models, and SMTP notifications.

* **Port**: `8000`
* **Setup dependencies**:
  ```bash
  cd telecom-backend
  uv sync
  ```
* **Run Server**:
  ```bash
  uv run uvicorn app.main:app --reload --port 8000
  ```
* **Run Tests**:
  ```bash
  uv run pytest
  ```

---

## 🤖 3. AI Inference Service (`telecom-ai-service`)
Processes incoming complaints, categorizes them, extracts structured technical failure domains, computes complexity, and routes solutions.

* **Port**: `8001`
* **Setup dependencies**:
  ```bash
  cd telecom-ai-service
  uv sync
  ```
* **Model Bootstrapping (First time only)**:
  ```bash
  uv run python trained_models/train_dummy_model.py
  ```
* **Run Server**:
  ```bash
  uv run uvicorn app.main:app --reload --port 8001
  ```
* **Run Tests**:
  ```bash
  uv run pytest
  ```

---

## 🌐 4. Frontend Application (`telecom-frontend`)
Next.js web application for the triage and resolution dashboard.

* **Port**: `3000`
* **Setup dependencies**:
  ```bash
  cd telecom-frontend
  npm install
  # or
  pnpm install
  ```
* **Run Dev Server**:
  ```bash
  npm run dev
  # or
  pnpm dev
  ```

---

## 🚀 Quickstart Script (All-in-One CLI)
You can also use the workspace helper script in the root directory:
* **Setup all services**: `./dev.sh setup`
* **Start FE and BE servers**: `./dev.sh start`
