# 🚀 ProjectMind AI v2 — Professional Academic Project Development SaaS

ProjectMind AI is a professional AI-powered academic project development platform built for MCA and Engineering students.

---

## 📁 Repository Directory Structure

```
ProjectMind-AI-main/
├── frontend/             # Next.js 14, React, TypeScript, Tailwind CSS, Clerk Auth
├── backend/              # Node.js + Express.js Main REST API Backend (Phase 2)
├── ai-service/           # Python + FastAPI AI Microservice & Gemini API Engine (Phase 3)
└── v1_legacy/            # Legacy Version 1 Streamlit Prototype (Isolated)
```

---

## 🛠️ Architecture Stack

* **Frontend**: Next.js 14 App Router, React, TypeScript, Tailwind CSS
* **Authentication**: Clerk Multi-Tenant Auth (Google OAuth & GitHub OAuth)
* **Main Backend**: Node.js + Express.js (REST APIs, user projects, exports)
* **AI Processing**: Python + FastAPI Microservice
* **AI Model Engine**: Google Gemini API
* **Database**: Supabase / PostgreSQL

---

## ⚡ Quick Start (Frontend Development)

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies (if not already installed)
npm install

# 3. Launch dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
