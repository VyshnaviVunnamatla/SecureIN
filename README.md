# 🔐 Zero Trust Authentication & Access Management System

A full-stack secure authentication platform based on **Zero Trust principles** — enhancing login security through real-time risk analysis, device/IP fingerprinting, OTP-based suspicious login validation, and admin-level user management.

## 🚀 Live Demo

- **Frontend** (React + Vercel): [https://zero-trust-auth-system.vercel.app](https://zero-trust-auth-system.vercel.app)
- **Backend** (Node.js + Express + Render): Hosted on Render with API endpoints

---

## 📌 Features

- 🔐 **Secure Login System**
  - Password-based login
  - JWT authentication

- 🧠 **Risk-Based Detection**
  - Detects suspicious logins using:
    - IP address
    - Device fingerprint (via `@fingerprintjs`)
    - Login time (odd hours)

- 📩 **OTP Verification**
  - Sends OTP to registered email for suspicious logins
  - OTP expires in 5 minutes

- 📊 **Admin Dashboard**
  - View login logs and risk scores (visualized using `react-chartjs-2`)
  - View city, country, timestamp, IP & device info
  - Role-based access: Admin / User

- 👥 **User Management (Admin only)**
  - Add, delete, and change roles of users
  - View all users with roles

- 🌍 **GeoIP & Device History**
  - Logs location using `ipapi.co`
  - Maintains trusted device and IP history

---

## 🛠️ Tech Stack

| Frontend  | Backend   | Database  | Deployment |
|-----------|-----------|-----------|------------|
| React     | Node.js   | MongoDB   | Vercel (FE) |
| Axios     | Express   | Mongoose  | Render (BE) |
| Chart.js  | bcryptjs  |           | MongoDB Atlas |

---

## 📁 Folder Structure

zero-trust-auth-system/
├── client/ # React frontend
│ ├── App.js
│ ├── AdminDashboard.js
│ └── ...
├── server/ # Express backend
│ ├── index.js
│ ├── routes/
│ ├── models/
│ ├── utils/
│ └── .env.example
└── README.md

---

## 🧪 Running Locally

### Prerequisites
- Node.js & npm
- MongoDB Atlas (or local)
- Vercel/Render accounts (optional)

### 1. Clone the repo
```bash
git clone https://github.com/your-username/zero-trust-auth-system.git
cd zero-trust-auth-system
```

### 2. Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Fill in your MongoDB URI, JWT_SECRET, and email credentials
npm start
```

### 3. Frontend Setup

```
cd client
npm install
npm start
```

---

## 🔒 Environment Variables (.env.example)

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OTP_EMAIL=your_email@gmail.com
OTP_APP_PASSWORD=your_app_specific_password
```

⚠ Never commit the actual .env file to GitHub!

---

## 📸 Screenshots

---

## 📝 License
MIT License. Use freely with attribution.

---

## 🤝 Contributing
Pull requests and feature suggestions are welcome. If you encounter a bug or want a new feature, feel free to open an issue.

---

## 📬 Contact

Made with ❤️ by Vyshnavi
📧 vyshnavivunnamatla21@gmail.com

