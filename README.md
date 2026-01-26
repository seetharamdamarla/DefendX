# DefendX

<div align="center">

**Enterprise-Grade Automated Vulnerability Detection & Attack Surface Monitoring**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-v3.9+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-v18-61DAFB.svg)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-v3.0-lightgrey.svg)](https://flask.palletsprojects.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v15+-336791.svg)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748.svg)](https://www.prisma.io/)

</div>

---

## Overview

DefendX is a comprehensive security assessment platform designed to automate the discovery of web-based vulnerabilities. By combining multi-layered reconnaissance with advanced rule-based detection and a production-ready PostgreSQL cloud backend, it provides security teams with a unified Command Center (SOC) to monitor and mitigate threats in real-time.

### Key Features

- **Automated Scanning**: Real-time detection of OWASP Top 10 vulnerabilities including:
    - **SQL Injection (SQLi)**: Pattern-based detection of potential injection points.
    - **Cross-Site Scripting (XSS)**: Identification of reflected and stored XSS risks.
    - **Sensitive Information Disclosure**: Detection of exposed API keys, PII, and debug info.
    - **CORS Misconfiguration**: Analysis of permissive Access-Control headers.
- **Security Operations Center (SOC)**: High-performance dashboard featuring risk scoring, threat trends, and target monitoring with SVG-driven health metrics.
- **Robust Backend Architecture**: 
    - **Connection Pooling**: Optimized database connection management with timeout prevention and auto-reconnection logic.
    - **Graceful Shutdown**: Signal handling ensures clean resource release and connection closure.
    - **Production Authentication**: Secure registration and sign-in system with **Bcrypt** password hashing.
- **Cloud-Native Database**: Scalable **PostgreSQL** integration via **Supabase** for high-integrity data storage using **Prisma ORM**.
- **Premium Design**: State-of-the-art glassmorphic UI with smooth animations and responsive layouts.

---

## Tech Stack

**Backend**: Python 3.9+, Flask, **Prisma ORM (Python)**, Bcrypt  
**Database**: **PostgreSQL** (Managed via Supabase) with Connection Pooling  
**Frontend**: React 18, Vite, TailwindCSS, Lucide Icons, Glassmorphism  
**Security Engine**: Modular vulnerability detection system, URL Validation, Rate Limiting (Flask-Limiter)

---

## Project Structure

```
DefendX/
├── backend/                # Flask API & Scanner Engine
│   ├── prisma/            # Prisma Schema & Database Configuration
│   │   └── schema.prisma  # Database models & connection settings
│   ├── database/          # Production-grade database wrapper
│   │   └── db.py          # Connection lifecycle management
│   ├── modules/           # Vulnerability detection modules
│   │   ├── checks/        # Specific security check logic (SQLi, XSS, etc.)
│   │   └── scanner.py     # Main scanning engine
│   ├── .env               # Environment variables
│   └── app.py             # Main entry point with signal handling
├── frontend/              # React Application
│   ├── src/
│   │   ├── components/    # Reusable UI & Layout components
│   │   ├── pages/         # Landing, Auth, SOC Dashboard
│   │   └── assets/        # Media & Global Styles
│   └── package.json
└── README.md
```

---

## Installation & Setup

### Prerequisites

- Python (v3.9+)
- Node.js (v18+)
- PostgreSQL Database (Supabase recommended)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/seetharamdamarla/DefendX.git
   cd DefendX
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Database Configuration**
   - Create a `.env` file in the `backend/` directory.
   - Add your connection string with pooling parameters:
     ```env
     DATABASE_URL="postgresql://user:password@host:port/database?pgbouncer=true&connection_limit=20&pool_timeout=30"
     ```
   - Generate the Prisma Client:
     ```bash
     prisma generate
     ```

4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend: [http://localhost:5000](http://localhost:5000)

---

## API Endpoints

**Base URL**: `http://localhost:5000/api`

### Authentication
- `POST /auth/register` - Create a new secure account
- `POST /auth/login` - Authenticate user and retrieve profile data

### Security Operations
- `POST /scan` - Initiate a security audit on a target URL
- `GET /scan/<id>` - Retrieve detailed results from the PostgreSQL store
- `GET /dashboard` - Fetch aggregate security metrics and threat trends
- `GET /targets` - List all unique targets and their current risk status

### System & Compliance
- `GET /health` - System health status and timestamp
- `GET /disclaimer` - Ethical use guidelines and requirements

---

## Troubleshooting

- **Database Timeout Errors**: If you encounter connection pool timeouts, ensure your `DATABASE_URL` includes the `pool_timeout=30` and `connection_limit` parameters as shown in the setup instructions. The logic in `db.py` handles auto-reconnection, but correct configuration is required for high concurrency.
- **Connection Refused**: Ensure your IP is allowed in your cloud database provider's firewall settings (e.g., Supabase dashboard).

---

## License

This project is licensed under the MIT License.

---

<div align="center">

Built with ❤️ by [Seetharam Damarla](https://github.com/seetharamdamarla)

**DefendX** © 2026

</div>
