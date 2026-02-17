# DefendX

<div align="center">

**Enterprise-Grade Automated Vulnerability Detection & Attack Surface Monitoring**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-v3.9+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-v18-61DAFB.svg)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-v3.0-lightgrey.svg)](https://flask.palletsprojects.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v16-336791.svg)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748.svg)](https://www.prisma.io/)

</div>

---

## Overview

DefendX is a high-performance security assessment platform built for the modern threat landscape. It transforms complex vulnerability scanning into a unified, glassmorphic **Security Operations Center (SOC)** dashboard. 

Featuring multi-user isolation, production-grade authentication, and real-time scanning powered by an advanced rule-based engine, DefendX provides security analysts with a professional-grade command center to monitor, detect, and mitigate web-based risks.

---

## Latest Features

### Enterprise-Grade Authentication
- **Multi-Auth Flow**: Secure registration using traditional Email/Password or one-click **Google OAuth**.
- **Session Management**: Robust server-side session handling with secure cookie configurations.
- **Bcrypt Hashing**: Industry-standard password protection.

### Professional SOC Dashboard
- **Security Health Score**: Real-time calculation of a target's posture using a professional vulnerability weighting algorithm.
- **Data Isolation**: Strict multi-user architecture—users only see their own scan history and statistics.
- **Dynamic Metrics**: Instant visibility into Total Scans, Active Targets, and Critical Risk distribution.
- **Interactive Trends**: Visual scan activity tracking over time.

### Advanced Scanning Capabilities
- **Automated Reconnaissance**: Rule-based detection of OWASP Top 10 vulnerabilities (SQLi, XSS, etc.).
- **Surface Monitoring**: Track multiple targets simultaneously with per-target status history.
- **Detailed Findings**: Drill-down modal for every vulnerability with technical descriptions and severity levels (Low, Medium, High, **Critical**).
- **Proactive Defense**: Identifies **Critical** SQL Injection and RCE vectors before they can be exploited.

### Real-Time Feedback
- **Notification System**: Instant alerts for completed scans and high-risk detections.
- **Premium UI**: Developed with **Framer Motion**, **Background Beams**, and **Glassmorphism** for a state-of-the-art diagnostic aesthetic.

---

## Tech Stack

- **Backend**: Python 3.9+, Flask, **Authlib (OAuth)**, **Flask-Limiter**
- **Database**: **PostgreSQL** (Managed via Neon Cloud)
- **ORM**: **Prisma (Python)** for type-safe database interactions
- **Frontend**: React 18, Vite, **TailwindCSS**, **Framer Motion**, **Lucide Icons**

---

## Project Structure

```
DefendX/
├── backend/                # Flask API & Scanner Engine
│   ├── prisma/            # Database Schema & Client
│   ├── database/          # Shared Prisma Instance & DB Logic
│   ├── modules/           # Vulnerability Engine & Health Scoring
│   │   ├── checks/        # Individual Vulnerability Modules (SQLi, XSS, etc.)
│   │   ├── auth.py        # OAuth & Email Auth Handlers
│   │   └── scanner.py     # Attack Surface Scanner Core
│   ├── app.py             # Main Entry Point
│   ├── vercel.json        # Vercel Deployment Config
│   └── requirements.txt   # Python Dependencies
├── frontend/              # React SOC Dashboard
│   ├── src/
│   │   ├── components/    # Reusable UI & Layouts
│   │   ├── pages/         # Dashboard, Landing, Auth
│   │   ├── types.ts       # TypeScript Definitions
│   │   └── App.tsx        # Application Routing
│   ├── vite.config.ts     # Vite Configuration
│   └── package.json
└── README.md
```

---

## Installation & Setup

### Prerequisites
- Python (v3.9+)
- Node.js (v18+)
- Neon PostgreSQL Account

### 1. Clone the project
```bash
git clone https://github.com/seetharamdamarla/DefendX.git
cd DefendX
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  
pip install -r requirements.txt
```

### 3. Environment Configuration
Create a `.env` file in the `backend/` directory with the following variables:
```env
DATABASE_URL="your-postgresql-connection-string"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:5000/api/auth/google/callback"
```

### 4. Initialize Database
```bash
prisma generate
# Optional: Use 'prisma db push' if starting with a new database
```

### 5. Start Backend Server
```bash
python app.py
```
*The API will be available at `http://localhost:5000`*

### 6. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
*The Dashboard will be live at `http://localhost:5173`*

---

## API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/signup` | `POST` | User registration |
| `/api/auth/login` | `POST` | Email authentication |
| `/api/auth/google/login` | `GET` | Google OAuth redirect |
| `/api/auth/logout` | `GET` | Clear current session |
| `/api/scan` | `POST` | Launch vulnerability audit |
| `/api/dashboard` | `GET` | Isolated SOC metrics |
| `/api/targets` | `GET` | User attack surface list |
| `/api/risks` | `GET` | All detected vulnerabilities |

---

## Deployment (Vercel)

DefendX is optimized for deployment on Vercel as two separate projects (Frontend & Backend).

### Backend Deployment
1. Import `backend/` directory as a new project.
2. Set Environment Variables:
   - `DATABASE_URL` (NeonDB)
   - `SECRET_KEY` (Random String)
   - `GOOGLE_CLIENT_ID` / `SECRET`
   - `FRONTEND_URL` (Your future frontend domain)
3. Set Install Command: `pip install -r requirements.txt && prisma generate`

### Frontend Deployment
1. Import `frontend/` directory as a new project.
2. Set Environment Variables:
   - `VITE_API_URL` (Your deployed backend domain)
3. Update Backend's `FRONTEND_URL` variable with the final frontend domain.

---

## Ethical Disclosure

DefendX is intended strictly for authorized security testing and educational purposes. Unauthorized scanning of targets is illegal. By using this tool, you take full responsibility for its operation and confirm you have explicit permission to test any target you scan.

---

<div align="center">

Built with ❤️ by [Seetharam Damarla](https://github.com/seetharamdamarla)

**DefendX** © 2026

</div>
