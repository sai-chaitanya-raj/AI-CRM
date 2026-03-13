# Uptiq.ai - AI-Powered CRM

Uptiq.ai is a modern, AI-integrated Customer Relationship Management (CRM) platform designed to streamline lead management, pipeline tracking, and sales analytics. Leveraging AI insights via the Groq SDK, it provides intelligent suggestions and data-driven perspectives to enhance sales productivity.

## Key Features

- **Smart Dashboard**: Real-time overview of key performance indicators and recent activities.
- **Lead & Pipeline Management**: Effortlessly track leads through customizable pipeline stages with drag-and-drop support.
- **AI Insights**: Get intelligent insights and predictions powered by the **Groq SDK**.
- **Interactive Analytics**: Visualize sales data with dynamic charts and graphs using **Recharts**.
- **Secure Authentication**: Robust security with JWT-based sessions, Google OAuth integration, and Two-Factor Authentication (2FA).
- **Responsive Design**: A premium, mobile-first user interface built with Tailwind CSS.

## Technical Stack

- **Frontend**:
  - React (Vite)
  - Tailwind CSS v4
  - Framer Motion (Animations)
  - Zustand (State Management)
  - React Router (Navigation)
- **Backend**:
  - Node.js & Express
  - MongoDB (Mongoose)
  - Groq SDK (AI Integration)
  - Jose/JWT (Security)
  - Nodemailer (Email verification)

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB instance (Local or Atlas)
- Groq API Key

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sai-chaitanya-raj/AI-CRM.git
   cd AI-CRM
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Create a .env file based on the provided .env.example
   npm start
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
