# CampusHub - Multi-Tenant Campus Management Platform

CampusHub is a robust, multi-tenant web application designed to streamline the management of student clubs, events, and memberships across multiple educational institutions. It provides a centralized platform where universities can manage their own isolated environments (tenants) while offering students a seamless experience to discover and join communities.

## 🚀 Key Features

*   **Multi-Tenancy Architecture**: 
    *   Strict data isolation for different institutions.
    *   Each institution has its own dedicated portal (e.g., `/:institutionCode/dashboard`).
*   **Role-Based Access Control (RBAC)**:
    *   **Admin**: Full control over institution settings, club approvals, and user management.
    *   **Club Lead**: Manage specific club events and member rosters.
    *   **Member**: Join clubs, view events, and participate in activities.
*   **Club & Event Management**:
    *   Automated workflows for creating clubs and requesting memberships.
    *   Conflict detection for event scheduling to prevent overlaps.
*   **Secure Authentication**:
    *   JWT-based authentication with session management.
    *   Password hashing (Bcrypt) and secure password reset flows (Email via SendGrid).
    *   Tenant guards to prevent unauthorized access across institutions.
*   **Modern UI/UX**:
    *   Responsive design built with React.js using a Glassmorphism aesthetic.
    *   Interactive dashboards with real-time feedback and dynamic greetings.

## 🛠️ Technology Stack

### Frontend
*   **React.js**: Component-based UI library.
*   **Tailwind CSS**: Utility-first CSS framework for rapid styling.
*   **React Router**: For client-side routing and navigation.
*   **Axios**: For handling HTTP requests.

### Backend
*   **Node.js & Express.js**: Scalable server-side runtime and framework.
*   **MongoDB & Mongoose**: NoSQL database for flexible data modeling.
*   **JSON Web Tokens (JWT)**: For stateless, secure authentication.
*   **SendGrid**: For reliable email delivery services.

## ⚙️ Setup & Installation

Follow these steps to set up the project locally.

### Prerequisites
*   Node.js (v14+)
*   MongoDB (running locally or Atlas URI)

### 1. Clone the Repository
```bash
git clone <repository_url>
cd multi-tenant
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=5008
MONGO_URI=mongodb://localhost:27017/multi-tenant-clubs
JWT_SECRET=your_super_secret_key
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_FROM=your_email@gmail.com
SENDGRID_API_KEY=your_sendgrid_key
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd ../frontend
npm install
```

Start the frontend development server:
```bash
npm run dev
```

The application should now be running at `http://localhost:5173`.

## 🧪 Usage

1.  **Institution Signup**: Go to `/institution/signup` to register a new university.
2.  **User Registration**: Use the generated institution link to register as a student or admin.
3.  **Explore**: Log in to access the dashboard, join clubs, and view events!

---
*Built with ❤️ for better campus communities.*
