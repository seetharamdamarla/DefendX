# DefendX

<div align="center">

**Advanced Automated Vulnerability Detection & Attack Surface Monitoring**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-v3.9+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-v18-61DAFB.svg)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-v2.x-lightgrey.svg)](https://flask.palletsprojects.com/)

</div>

---

## Overview

DefendX is a comprehensive security assessment platform designed to automate the discovery of web-based vulnerabilities. By combining multi-layered reconnaissance with advanced rule-based detection, it provides security teams with a unified Command Center (SOC) to monitor and mitigate threats in real-time.

### Key Features

- **Automated Scanning**: Real-time detection of OWASP Top 10 vulnerabilities including SQLi, XSS, and Sensitive Data Exposure.
- **Security Operations Center (SOC)**: High-performance dashboard featuring risk scoring, threat trends, and target monitoring.
- **Multi-layered Reconnaissance**: Deep-crawl engine for mapping attack surfaces and identifying misconfigured security headers.
- **Secure Authentication**: Built-in registration and login system with session persistence and secure local data handling.
- **Premium Design**: State-of-the-art glassmorphic UI with smooth animations and responsive layouts.

---

## Tech Stack

**Backend**: Python, Flask, SQLite, AttackSurfaceScanner engine  
**Frontend**: React 18, Vite, TailwindCSS, Lucide Icons, Glassmorphism  
**Security Engine**: Rule-based vulnerability modules, URL Validation, Rate Limiting (Flask-Limiter)

---

## Project Structure

```
DefendX/
├── backend/                # Flask API & Scanner Engine
│   ├── database/          # SQLite schema & DB wrapper
│   ├── modules/           # Vulnerability detection modules
│   │   └── checks/        # Specific security check logic
│   └── app.py             # Main entry point & API routes
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
- npm

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
   python app.py
   ```

3. **Frontend Setup**
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

### Security Operations
- `POST /scan` - Initiate a security audit on a target URL
- `GET /scan/<id>` - Retrieve detailed results of a specific scan
- `GET /dashboard` - Fetch aggregate security metrics and trends
- `GET /targets` - List all unique targets and their current risk status

### System & Compliance
- `GET /health` - System status and timestamp
- `GET /disclaimer` - Ethical use guidelines and requirements

---

## License

This project is licensed under the MIT License.

---

<div align="center">

Built with ❤️ by [Seetharam Damarla](https://github.com/seetharamdamarla)

**DefendX** © 2026

</div>
