# Clinova Health — Smart Hospital OPD Queue Management System
A full-stack, enterprise-grade outpatient department (OPD) queue and clinical workflow platform. Built with React 19 + Tailwind CSS, Django 6 + REST Framework, and MySQL 8.0.

---

## 🏥 Hospital System Highlights

- **Staff Portal**: Receptionist & OPD Nurse ID login (`CN1021`) with shift management.
- **Clinics Hub**: Multi-doctor queue management with dedicated consultation rooms, live wait times, and queue creation.
- **Live OPD Board**: Real-time patient calling (`Call Next`), medical triage reordering (`Up` / `Down`), priority tags, and cancellation.
- **Consultation & Rx Presets**: Department-tailored medical prescriptions (Pediatrics, Cardiology, Orthopedics, General Medicine, Pathology) + custom advice input with persistent audit tracking.
- **Clinical Analytics & Audit**:
  - Live Doctor Clearance Rate & Efficiency Strip (92% clearance rate, peak hour 10:30 AM, fastest clearance 1:00 PM).
  - Hourly Patient Footfall vs. Attended Consultations curve chart.
  - Department-wise average wait time comparisons.
  - 135+ Completed Consultations Audit Table with search, department filtering, and CSV export.

---

## 📋 PDF Functional Requirements Coverage

| # | Assignment Requirement | Clinova Health Implementation | UI View |
| :---: | :--- | :--- | :--- |
| **1** | **Queue Manager can login and create Queues** | Staff ID authentication + modal to create and launch new doctor queues. | `Login Portal` & `Clinics Hub` |
| **2** | **Each Queue has a Name** | Distinct doctor names and department tags (`Dr. Ashwin - Orthopedics`, `Dr. Rajesh Verma - Cardiology`, etc.). | `Clinics Hub` & `Live OPD Board` |
| **3** | **Manager can add new persons / tokens [token created]** | Patient registration modal creates sequential tokens (`GP01`, `PED01`, etc.) with age, gender, notes, and live timestamp. | `Live OPD Board` (`+ Register Patient`) |
| **4** | **Queue displays the list of people / tokens waiting** | Real-time queue list with token badges, patient names, priority flags, and waiting counts. | `Live OPD Board` (Waiting Queue) |
| **5** | **Manager can move tokens up and down in queue** | Interactive `Up` and `Down` action buttons on waiting tokens with atomic position swapping in MySQL. | `Live OPD Board` (`Up` / `Down` buttons) |
| **6** | **Assign token at top of queue for service [simple button click]** | Single green `Call Next` button moves top patient into active room (`Now in Consultation`), followed by `Finish Consultation & Save`. | `Live OPD Board` (Active Spotlight Card) |
| **7** | **Manager can cancel a token from the queue** | Red `✕ Cancel` button removes token and dynamically shifts succeeding waiting tokens forward. | `Live OPD Board` (`✕ Cancel` button) |
| **8** | **Dashboard showing analytics on wait times & queue trends** | Executive clinical dashboard tracking wait times, peak footfall curve, efficiency metrics, and 135+ completed patient records. | `Analytics & Trends` Dashboard |

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS | Animated glassmorphic OPD dashboard, live triage board, SVG stethoscope branding |
| **Backend** | Python 3.14, Django 6.1, Django REST Framework | REST API endpoints, token ordering, audit persistence |
| **Database** | MySQL 8.0 (`clinova_opd`) | Relational persistence (`Doctors` and `Patients` tables) |
| **Icons & Charts**| Lucide React, Chart.js, React-ChartJS-2 | Medical vectors, footfall line curves, department wait-time bars |

---

## 🚀 Running the Project Locally

### 1. Backend (Django + MySQL)
```powershell
cd backend
.\venv\Scripts\python.exe manage.py migrate
.\venv\Scripts\python.exe seed_data.py
.\venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
```

### 2. Frontend (React + Vite)
```powershell
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

