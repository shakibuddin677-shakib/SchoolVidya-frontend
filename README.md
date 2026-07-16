<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:1a1a2e,100:2b6ecf&height=180&section=header&text=SchoolVidya&fontSize=55&fontColor=ffffff&fontAlignY=35&desc=A%20full-stack%20school%20management%20ERP&descAlignY=55&descSize=18" alt="SchoolVidya banner"/>

<br/>

[![Live Demo](https://img.shields.io/badge/🚀_LIVE_DEMO-Visit_Site-2b6ecf?style=for-the-badge)](https://school-vidya-frontend.vercel.app)

<br/>

![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?style=flat-square&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-RTK_Query-764ABC?style=flat-square&logo=redux&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/license-ISC-blue?style=flat-square)

**A role-based school management ERP** — built for Admin, Teacher, and Student workflows, from attendance and fees to exams, results, and a library system.

[**🔗 View Live Site**](https://school-vidya-frontend.vercel.app)

</div>

<br/>

## 📋 Table of Contents

<details>
<summary>Click to expand</summary>

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Modules](#-api-modules)
- [Security](#-security)
- [Roadmap](#-roadmap)
- [Author](#-author)
- [License](#-license)

</details>

<br/>

## 🌍 Overview

SchoolVidya is a full-stack ERP that digitizes day-to-day school operations — attendance, fees, homework, exams, results, timetable, library, and notices — behind a role-based access system for **Admin**, **Teacher**, and **Student** accounts. It's built as a separate REST API (Express + MongoDB) consumed by a React SPA (Vite + Redux Toolkit Query), with JWT auth delivered via httpOnly cookies and Cloudinary-backed media uploads.

> ⚠️ **Note:** The backend may be on a free-tier host and can take a few seconds to wake up on the first request after inactivity.

<br/>

## ✨ Features

<table>
<tr>
<td width="50%" valign="top">

**🔐 Role-Based Access Control**
- Three roles — Admin, Teacher, Student — enforced with route-level middleware (`isAuthenticated` + `allowRoles`)
- JWT auth via httpOnly cookies, bcrypt-hashed passwords
- Forgot/reset password flow with expiring tokens

**🏫 Academic Management**
- Classes, sections, and subjects with teacher assignment
- Timetable builder per class/section
- Attendance marking (section-wise) with a dedicated student view

**📝 Exams & Results**
- Exam and exam-schedule creation
- Result entry, with an admin release/unpublish toggle
- Auto-generated, printable student marksheets

</td>
<td width="50%" valign="top">

**💰 Fees**
- Configurable fee structures per class
- Fee payment recording with auto-generated monthly tuition fees
- Printable fee receipts

**📚 Library & Homework**
- Book catalog with copy tracking and issue/return workflow
- Homework assignment, submission, and grading per class

**📊 Reports & Dashboard**
- Aggregation-pipeline-driven reports: attendance %, fee collection, exam performance, top teachers
- Role-specific dashboards with charts (Recharts)
- CSV export and print-to-PDF (via a hidden same-page iframe, avoiding the mobile popup-print and Tailwind OKLCH canvas-rendering issues)

**📧 Notifications**
- Auto-generated login credentials emailed to new users via Nodemailer + Brevo SMTP
- Password reset emails with signed, expiring tokens

</td>
</tr>
</table>

<br/>

## 🛠️ Tech Stack

<div align="center">

![Skills](https://skillicons.dev/icons?i=nodejs,express,mongodb,react,redux,tailwind,vite,git,github,vercel)

</div>

| Layer | Tools |
|---|---|
| **Frontend** | React 19, Vite, React Router |
| **State / Data Fetching** | Redux Toolkit, RTK Query |
| **Styling** | Tailwind CSS v4 |
| **Charts / Icons** | Recharts, Lucide React |
| **Backend** | Node.js, Express 5 |
| **Database / ODM** | MongoDB, Mongoose |
| **Auth** | JWT (httpOnly cookies), bcryptjs |
| **Media** | Cloudinary, Multer, streamifier |
| **Email** | Nodemailer + Brevo SMTP |
| **Security** | Helmet, CORS, cookie-parser |
| **Deployment** | Vercel (frontend) |

<br/>

## 📸 Screenshots

<div align="center">

<table>
<tr>
<td align="center" width="33%"><b>Login Page</b></td>
<td align="center" width="33%"><b>Admin Dashboard</b></td>
<td align="center" width="33%"><b>Teacher Dashboard</b></td>
<td align="center" width="33%"><b>Student Dashboard</b></td>
</tr>
<tr>
<td><img src="screenshots\Login Page.png" width="100%"/></td>
<td><img src="screenshots\Admin Dashboard.png" width="100%"/></td>
<td><img src="screenshots\Teacher Dashbaord.png" width="100%"/></td>
<td><img src="screenshots\Teacher Dashbaord.png" width="100%"/></td>
</tr>
</table>

</div>

> 📝 Drop your screenshots into a `screenshots/` folder at the project root using the filenames above — they'll render automatically.

<br/>

## 📁 Project Structure

```
SchoolVidya/
├── backend/
│   ├── index.js                  # App entry point — middleware, DB, routes
│   ├── config/                   # DB & Cloudinary config
│   ├── controllers/               # Route handler logic (18 modules)
│   ├── middleware/                # auth, role (RBAC), ownership, upload
│   ├── models/                    # Mongoose schemas
│   ├── routes/                    # Express routers
│   ├── templates/                 # HTML email templates
│   └── utils/                     # token/email/upload/fee-automation helpers
│
└── frontend/
    ├── src/
    │   ├── api/                   # axios instance + RTK Query base slice
    │   ├── app/                   # Redux store
    │   ├── components/            # layout & shared UI components
    │   ├── features/              # feature-sliced modules (auth, students,
    │   │                            teachers, classes, attendance, exams,
    │   │                            fees, library, homework, notices,
    │   │                            parents, reports, dashboard)
    │   ├── routes/                # AppRoutes + ProtectedRoute
    │   └── utils/                 # export/print & attendance helpers
    └── public/
```

<br/>

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x
- A MongoDB Atlas cluster (or local MongoDB instance)
- A Cloudinary account
- A Brevo (SMTP) account for transactional emails

### Installation

```bash
git https://github.com/shakibuddin677-shakib/SchoolVidya-frontend
cd frontend
git https://github.com/shakibuddin677-shakib/SchoolVidya
cd Backend
```

**Backend**
```bash
cd backend
npm install
```

**Frontend**
```bash
cd ../frontend
npm install
```

### Environment Variables

`backend/.env`
```env
PORT=8000
MONGO_URL=your_mongodb_connection_string
ADMIN_EMAIL=admin_seed_email
ADMIN_PASSWORD=admin_seed_password
JWT_SECRET=your_jwt_secret
BREVO_HOST=smtp-relay.brevo.com
BREVO_PORT=587
BREVO_USER=your_brevo_user
BREVO_PASS=your_brevo_password
MAIL_FROM=your_sender_email
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
```

`frontend/.env`
```env
VITE_API_URL=http://localhost:8000/api
```

### Run locally

**Backend**
```bash
cd backend
npm run dev
```

**Frontend** (in a separate terminal)
```bash
cd frontend
npm run dev
```

On first boot, the backend automatically seeds an Admin account from `ADMIN_EMAIL` / `ADMIN_PASSWORD` — use those to log in and create Teacher/Student accounts from the Admin dashboard.

<br/>

## 🔌 API Modules

All routes are prefixed with `/api` and protected with `isAuthenticated` + role-based `allowRoles` middleware unless noted.

<details>
<summary><b>View all modules</b></summary>
<br/>

| Base Route | Resource | Access |
|---|---|:---:|
| `/auth` | Login, logout, forgot/reset password, check-auth | Public / Authenticated |
| `/users` | Create student/teacher accounts, manage users | Admin |
| `/classes` `/sections` `/subjects` | Academic structure CRUD | Admin |
| `/parents` | Parent contact records (linked to students) | Admin |
| `/attendance` | Mark & fetch section-wise attendance | Admin, Teacher |
| `/timetable` | Class/section timetable CRUD | Admin |
| `/exams` `/exam-schedules` | Exam creation, scheduling, result release | Admin, Teacher |
| `/results` | Result entry | Admin, Teacher |
| `/fee-structures` `/fee-payments` | Fee configuration & payment recording | Admin |
| `/books` `/book-issues` | Library catalog & issue/return | Admin |
| `/homework` `/homework-submissions` | Homework assignment & grading | Admin, Teacher |
| `/notices` | School-wide notices | Admin |
| `/reports` | Dashboard stats & aggregation-based reports | Admin, Teacher |

</details>

<br/>

## 🔒 Security

- Passwords hashed with **bcryptjs**, never returned in queries (`select: false`)
- JWT stored in **httpOnly cookies** — inaccessible to client-side JS
- **Helmet** for secure HTTP headers, strict **CORS** locked to the frontend origin
- Route-level RBAC via reusable `allowRoles(...roles)` middleware
- Password reset tokens are time-limited and single-use

<br/>

## 🗺️ Roadmap

- [ ] Parent login portal (currently contact-only records)
- [ ] Real-time notifications
- [ ] Automated test suite

<br/>

## 👤 Author

<div align="center">

**Shakibuddin**
B.Tech CSE (Lateral Entry) · IES College of Technology, Bhopal

[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/shakibuddin677-shakib)

</div>

<br/>

## 📄 License

This project is licensed under the **ISC License**.

<br/>

<div align="center">

If you found this project useful, consider giving it a ⭐ on GitHub!

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:2b6ecf,100:1a1a2e&height=100&section=footer" alt="footer"/>

</div>
