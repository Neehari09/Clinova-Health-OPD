# MediQueue — Hospital OPD Queue Management System

A full-stack web application designed for hospital Outpatient Departments (OPD), clinics, and diagnostic centers to streamline patient token flow, consultation calling, medical triage priority, and wait-time analytics.

Built to fulfill all requirements of the **Rugas Technologies Full Stack Assignment**.

---

## 📸 System Visual Reference & UI Mockups

All mockups are located directly in this project directory:

| Screen | File Name | Description & Assignment Mapping |
| :--- | :--- | :--- |
| **Screen 1** | [`mediqueue_screen1_login_and_clinics.jpg`](./mediqueue_screen1_login_and_clinics.jpg) | **Staff Login & Doctor Queues Hub** (Points 1 & 2) — Receptionist login, doctor queue cards, "+ Create New Doctor Queue" modal. |
| **Screen 2** | [`mediqueue_screen2_live_opd_board.jpg`](./mediqueue_screen2_live_opd_board.jpg) | **Live OPD Patient Waiting & Triage Board** (Points 3, 4, 5, 6, 7) — Currently in consultation, waiting list, Up/Down triage reordering, "Serve Next" button, and Cancel action. |
| **Screen 3** | [`mediqueue_screen3_analytics_dashboard.jpg`](./mediqueue_screen3_analytics_dashboard.jpg) | **Hospital OPD Analytics & Wait-Time Dashboard** (Point 8) — Average patient wait time, hourly footfall trend (morning rush peak at 10:30 AM), wait-time distribution bars, and audit log. |

---

## 🏥 Real-Time Hospital OPD Scenario

* **Hospital**: City Care Hospital (OPD Reception Desk 1)
* **Queue Manager**: Nurse Priya (OPD Receptionist / Triage Nurse)
* **Doctors on Duty**:
  * `Dr. Sharma - General Medicine (Room 101)`
  * `Dr. Anita Roy - Pediatrics & Child Care (Room 104)`
  * `Pathology & Blood Sample Collection (Lab 1)`

### The Daily Patient Journey:
```
[Patient Arrives at OPD] 
          │
          ▼
[Nurse Enters Name: "Sunita Devi"] ──► System Generates Token #MED-101
                                                │
                                                ├──► [High Fever / Senior Citizen?]
                                                │         └──► Nurse clicks [▲ Move Up] (Triage)
                                                │
                                                ├──► [Emergency / Diverted to Trauma ICU?]
                                                │         └──► Nurse clicks [✕ Cancel]
                                                │
                                                ▼
                                    [Dr. Sharma clicks "Serve Next"]
                                                │
                                                ▼
                                   [Status: IN_CONSULTATION in Room 101]
                                                │
                                                ▼
                                    [Consultation Done ──► COMPLETED]
                                                │
                                                ▼
                           [Wait Time logged into Hospital Analytics]
```

---

## 📋 1-to-1 Mapping of All 8 Assignment Requirements

| # | Assignment Requirement | MediQueue Hospital Implementation | UI Location |
| :-: | :--- | :--- | :--- |
| **1** | **Queue Manager can login and create Queues** | Nurse Priya logs in with staff credentials; clicks `+ Create New Doctor Queue` to initialize doctor consultation rooms. | [Screen 1](./mediqueue_screen1_login_and_clinics.jpg) (Staff Portal & Create Queue Modal) |
| **2** | **Each Queue has a Name** | Each queue is explicitly named: `"Dr. Sharma - General Medicine (Room 101)"`, `"Dr. Anita Roy - Pediatrics (Room 104)"`. | [Screen 1](./mediqueue_screen1_login_and_clinics.jpg) & [Screen 2](./mediqueue_screen2_live_opd_board.jpg) |
| **3** | **Manager can add new persons / tokens [token created]** | Patient arrives at reception; nurse enters name & age; system generates unique token (e.g. `#MED-101`) and assigns waiting position. | [Screen 2](./mediqueue_screen2_live_opd_board.jpg) (`+ Register Patient / New Token`) |
| **4** | **Queue displays the list of people / tokens waiting** | Clean live table showing token number, patient name, arrival time, wait duration, and `WAITING` status badge. | [Screen 2](./mediqueue_screen2_live_opd_board.jpg) (Live OPD Patient Queue) |
| **5** | **Manager can move tokens up and down in queue** | **Medical Triage Priority**: Nurse moves an acute fever or elderly patient (e.g. Sunita Devi, 74F) up `↑` ahead of routine checkups. | [Screen 2](./mediqueue_screen2_live_opd_board.jpg) (`↑` and `↓` buttons) |
| **6** | **Assign token at top of queue for service [simple button click]** | When Doctor is ready, nurse clicks single green **"Serve Next"** button; patient enters Room 101 (`status = IN_SERVICE`). | [Screen 2](./mediqueue_screen2_live_opd_board.jpg) (Green `Serve Next` button) |
| **7** | **Manager can cancel a token from the queue** | Patient redirected to Emergency Casualty Ward or leaves; nurse clicks red **`✕ Cancel`** button. | [Screen 2](./mediqueue_screen2_live_opd_board.jpg) (Red `✕` action button) |
| **8** | **Dashboard showing analytics on wait times & queue trends** | Executive clinical dashboard tracking average patient wait time (8.4 mins), hourly footfall rush hours (peak at 10:30 AM), and wait distribution. | [Screen 3](./mediqueue_screen3_analytics_dashboard.jpg) (Analytics Dashboard) |

---

## 🛠️ Technology Stack

| Layer | Technology | Role in MediQueue |
| :--- | :--- | :--- |
| **Backend** | **Python 3.14 + Django 6.0** | Core business logic, User authentication, ORM database models, and migrations. |
| **API** | **Django REST Framework (DRF)** | RESTful API endpoints, token auth, JSON serialization, and transactional endpoints. |
| **Database** | **SQL (SQLite / PostgreSQL)** | Relational database holding doctors, queues, patient tokens, and consultation timestamps. |
| **Frontend** | **React.js (Vite)** | Single Page Application (SPA) offering fast state updates without full-page reloads. |
| **Styling** | **Tailwind CSS + Lucide React** | Medical UI aesthetic (clinical cyan, clean white cards, accessible status tags). |
| **Analytics Charts**| **Chart.js (`react-chartjs-2`)** | Visualizing hourly patient footfall trendlines and wait-time distribution bars. |
| **Deployment & VCS**| **Git & GitHub** | Source code management and repository submission for evaluation. |

---

## 🗄️ Database Architecture (SQL Schema)

```
┌─────────────────────────────────┐
│              USER               │
├─────────────────────────────────┤
│ id (PK)                         │
│ username ("nurse_priya")        │
│ email ("priya@citycare.org")    │
│ password (hashed)               │
└────────────────┬────────────────┘
                 │ 1
                 │ manages
                 │ N
┌────────────────▼────────────────┐
│             QUEUE               │
├─────────────────────────────────┤
│ id (PK)                         │
│ manager_id (FK -> User)         │
│ name ("Dr. Sharma - Room 101")  │
│ department ("General Medicine") │
│ room_number ("101")             │
│ is_active (Boolean)             │
│ created_at (Timestamp)          │
└────────────────┬────────────────┘
                 │ 1
                 │ contains
                 │ N
┌────────────────▼────────────────┐
│             TOKEN               │
├─────────────────────────────────┤
│ id (PK)                         │
│ queue_id (FK -> Queue)          │
│ token_number ("#MED-101")       │
│ patient_name ("Sunita Devi")    │
│ patient_age (Integer)           │
│ priority_level ("NORMAL"/"HIGH")│
│ position (Integer: 1, 2, 3...)  │
│ status ("WAITING", "IN_SERVICE",│
│         "COMPLETED", "CANCELLED")│
│ created_at (Timestamp - arrival)│
│ served_at (Timestamp - called)  │
│ completed_at (Timestamp)        │
│ cancelled_at (Timestamp)        │
└─────────────────────────────────┘
```

---

## 🔌 API Endpoints Specification

### Authentication
* `POST /api/auth/register/` — Register hospital OPD staff.
* `POST /api/auth/login/` — Staff login (returns auth token).
* `POST /api/auth/logout/` — Staff logout.

### Doctor Queues Management
* `GET /api/queues/` — List all active doctor queues for logged-in nurse.
* `POST /api/queues/` — Create new doctor clinic queue (`name`, `department`, `room_number`).
* `GET /api/queues/<id>/` — Queue details and current room status.

### Patient Token & Queue Operations
* `GET /api/queues/<id>/tokens/` — List of waiting patients ordered by `position ASC`.
* `POST /api/queues/<id>/tokens/` — Register new patient and issue token (`patient_name`, `age`).
* `POST /api/tokens/<id>/move-up/` — Triage priority: Swap position with preceding patient.
* `POST /api/tokens/<id>/move-down/` — Swap position with following patient.
* `POST /api/queues/<id>/serve-next/` — Single click: Assign top waiting patient to doctor (`IN_SERVICE`).
* `POST /api/tokens/<id>/cancel/` — Cancel token (diverted to ICU or left).
* `POST /api/tokens/<id>/complete/` — Complete doctor consultation.

### Clinical Analytics
* `GET /api/queues/<id>/analytics/` — Returns average wait time, hourly footfall trends, and wait distribution.

---

## 🗂️ Project Directory & File Structure

```
Rugas_Tech/
│
├── Full stack assignment (1).pdf         # Original assignment brief
├── README.md                             # This documentation & plan
│
├── mediqueue_screen1_login_and_clinics.jpg    # Mockup 1: Login & Clinics Hub
├── mediqueue_screen2_live_opd_board.jpg       # Mockup 2: Live OPD Board & Triage
├── mediqueue_screen3_analytics_dashboard.jpg  # Mockup 3: Analytics Dashboard
│
├── backend/                              # Django Backend
│   ├── manage.py
│   ├── requirements.txt                  # django, djangorestframework, django-cors-headers
│   ├── mediqueue_backend/                # Core Django configuration
│   │   ├── __init__.py
│   │   ├── settings.py                   # Apps, DB, CORS, Auth config
│   │   ├── urls.py                       # Root URL routes
│   │   └── wsgi.py
│   │
│   └── opd_queues/                       # Hospital Queues Application
│       ├── __init__.py
│       ├── admin.py                      # Django admin panel
│       ├── models.py                     # Queue and Token models
│       ├── serializers.py                # DRF serializers
│       ├── urls.py                       # API endpoints
│       └── views.py                      # Business logic, triage swaps, analytics
│
└── frontend/                             # React Application (Vite)
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── src/
    │   ├── main.jsx                      # App root
    │   ├── App.jsx                       # Router setup
    │   ├── api/
    │   │   └── client.js                 # Axios API client
    │   ├── components/
    │   │   ├── Navbar.jsx                # Header with hospital branding
    │   │   ├── DoctorQueueCard.jsx       # Doctor queue card overview
    │   │   ├── RegisterPatientModal.jsx  # New patient token form
    │   │   ├── PatientRow.jsx            # Token item with Up/Down/Serve/Cancel buttons
    │   │   ├── ServingBanner.jsx         # "In Consultation - Room 101" banner
    │   │   └── MetricCard.jsx            # KPI cards (Wait time, attended count)
    │   └── pages/
    │       ├── LoginPage.jsx             # Staff portal sign-in
    │       ├── ClinicsOverviewPage.jsx   # All doctor queues & creation
    │       ├── LiveOPDBoardPage.jsx      # Real-time triage & consultation board
    │       └── AnalyticsPage.jsx         # Wait-time and rush-hour charts
```

---

## 🚀 Step-by-Step Implementation Procedure

### Step 1: Initialize Backend & Database
1. Create Python virtual environment and install dependencies:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   pip install django djangorestframework django-cors-headers
   ```
2. Create Django project `mediqueue_backend` and app `opd_queues`.
3. Define `Queue` and `Token` models with transaction-safe ordering logic.
4. Run migrations: `python manage.py makemigrations && python manage.py migrate`.

### Step 2: Implement Business Logic & API Views
1. **Move Up / Down Endpoint**: Uses `@transaction.atomic` to swap integer positions without race conditions.
2. **Serve Next Endpoint**: Completes active consultation, promotes position 1 to `IN_SERVICE`, logs `served_at = now()`.
3. **Cancel Endpoint**: Sets `status = 'CANCELLED'` and shifts trailing tokens down by 1.
4. **Analytics Endpoint**: Computes average wait duration:
   $$\text{Avg Wait Time} = \frac{\sum (\text{served\_at} - \text{created\_at})}{\text{Total Served}}$$
   and groups patient counts by hour for trendlines.

### Step 3: Initialize Frontend (React + Vite)
1. Initialize React app:
   ```bash
   npm create vite@latest frontend -- --template react
   cd frontend
   npm install axios lucide-react react-router-dom chart.js react-chartjs-2
   ```
2. Configure Tailwind CSS with medical cyan/blue theme.
3. Build responsive views: Login, Clinics Hub, Live OPD Board, and Analytics.

### Step 4: Verification & Testing
1. Test edge cases: Moving top patient up (boundary check), canceling middle patient (position re-indexing).
2. Test concurrency: Rapid clicking of "Serve Next" ensures only one patient is `IN_SERVICE` at a time.
3. Verify analytics calculations against known test data.

### Step 5: Git & GitHub Deployment
1. Initialize git repository: `git init`.
2. Commit clean, structured commits for backend and frontend.
3. Push to GitHub with this `README.md` and screenshots for evaluation.

---

## 💡 Interview Readiness & Technical Questions

If shortlisted for the technical interview, you can confidently explain:
1. **Why Hospital OPD Theme?**
   * Priority reordering (`Move Up`) is an essential medical requirement (**Triage**), where acute/elderly cases must precede general follow-ups.
2. **How Concurrency is Handled**:
   * Uses Django's `@transaction.atomic` and database row locks (`select_for_update()`) during position swaps to prevent race conditions.
3. **How Wait-Time is Calculated**:
   * Measured accurately as the duration between patient registration (`created_at`) and when the doctor calls them into the consultation room (`served_at`).

