# CampusHub - Multi-Tenant Campus Management Platform

**CampusHub is a comprehensive digital operating system for university student communities, designed as a scalable multi-tenant SaaS platform.**

Think of it as a "Shopify for Campus Clubs" — a platform where any educational institution can sign up and instantly launch their own dedicated portal for managing specialized clubs, events, and student memberships with complete data isolation and security.

---

## 📋 Project Overview

CampusHub addresses the chaos of managing student life by replacing scattered Google Forms, email threads, and notice boards with a unified, secure, and beautifully designed platform. It handles complex workflows of university campuses through an intuitive interface that serves administrators, club leads, and students.

**What creates value:**
- **For Administrators**: A powerful command center to oversee all club activities, approve requests with a click, manage users, and maintain comprehensive audit logs.
- **For Club Leads**: Tools to manage rosters, schedule events without time conflicts, and engage members effectively.
- **For Students**: A single place to discover communities, join clubs, register for events, and manage their campus involvement.

## ⚡ Technical Highlights 
It's a **Multi-Tenant SaaS Application**.
*   **Architecture**: I implemented a **Multi-Tenant** architecture (similar to how Slack or Discord works). One codebase serves multiple universities, but each university's data is strictly isolated using Middleware Guards.
*   **Security**: Bank-grade security practices including **Role-Based Access Control (RBAC)** (ensuring students can't access admin features) and secure **JWT Authentication**.
*   **Design**: Built with a focus on **User Experience**. I moved away from boring dashboards and designed a modern "Glassmorphism" UI that feels premium and responsive.
*   **Real-World Features**: Includes automated email notifications (via SendGrid) and conflict-detection algorithms for event planning.

## 🛠️ Tech Stack
*   **Frontend**: React.js, Tailwind CSS (Custom Design System), React Router
*   **Backend**: Node.js, Express.js (RESTful API)
*   **Database**: MongoDB (Mongoose), tailored for flexible schema design
*   **DevOps/Tools**: Git, SendGrid API

## 💻 How to Run This Project

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance like MongoDB Atlas)
- SendGrid API key (for email functionality)

### Installation Steps

1. **Clone the repository**
    ```bash
    git clone <repository_url>
    cd multi-tenant
    ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```
   
   Create a `.env` file in the `backend` directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_REFRESH_SECRET=your_refresh_token_secret
   FRONTEND_URL=http://localhost:5173
   SENDGRID_API_KEY=your_sendgrid_api_key
   EMAIL_FROM=your_verified_sendgrid_email
   ```
   
   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```
   
   Start the development server:
   ```bash
   npm run dev
   ```

4. **Access the Application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`
   - Register a new Institution at `/institution/signup` to see the multi-tenancy in action

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
```

**Backend:**
```bash
cd backend
npm start
```

---

## 📁 Project Structure

```
multi-tenant/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Business logic handlers
│   ├── middleware/       # Authentication, error handling, institution scoping
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API route definitions
│   ├── utils/           # Helper functions (JWT, email, audit, cron)
│   └── server.js        # Express app entry point
│
└── frontend/
    ├── src/
    │   ├── components/  # Reusable UI components
    │   ├── context/     # React context (Auth)
    │   ├── pages/       # Route components
    │   ├── styles/      # CSS stylesheets
    │   ├── utils/       # API utilities
    │   └── App.jsx      # Main app component
    └── vite.config.js   # Vite configuration
```

---

## 🔑 Key API Endpoints

### Authentication
- `POST /api/institutions/register` - Register new institution
- `POST /api/auth/login` - Global login
- `POST /api/auth/register` - User registration (tenant-scoped)
- `POST /api/auth/request-reset` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `PUT /api/auth/password` - Change password (protected)

### Clubs
- `GET /api/:institutionCode/clubs` - Get all clubs
- `GET /api/:institutionCode/clubs/:clubId` - Get club details
- `POST /api/:institutionCode/clubs/:clubId/join` - Join a club

### Events
- `GET /api/:institutionCode/events` - Get all events (paginated)
- `GET /api/:institutionCode/events/:eventId` - Get event details
- `POST /api/:institutionCode/events/:eventId/register` - Register for event

### Admin
- `POST /api/:institutionCode/admin/clubs` - Create club
- `GET /api/:institutionCode/admin/requests` - Get pending membership requests
- `PATCH /api/:institutionCode/admin/requests/:id` - Approve/reject membership
- `POST /api/:institutionCode/admin/events` - Create event
- `GET /api/:institutionCode/admin/users` - Get all users
- `GET /api/:institutionCode/admin/audit-logs` - Get audit logs

---

## 🎯 Use Cases

1. **University Administration**: Manage multiple clubs, approve memberships, create institution-wide events, and maintain user directories.

2. **Club Leadership**: Oversee club members, schedule club-specific events, and engage with the community.

3. **Student Engagement**: Discover clubs, join communities, register for events, and track personal involvement.

4. **Event Coordination**: Prevent scheduling conflicts, manage event capacity, and ensure smooth event registration.

---

## 🔒 Security Features

- **Data Isolation**: Complete separation of data between institutions
- **Password Security**: Bcrypt hashing with salt rounds
- **Token Security**: Secure reset tokens with expiration and single-use validation
- **Rate Limiting**: Prevents brute force attacks and API abuse
- **Input Validation**: Comprehensive validation on all user inputs
- **SQL/NoSQL Injection Prevention**: Sanitized database queries
- **XSS Protection**: Cleaned user inputs to prevent cross-site scripting
- **CORS Configuration**: Controlled cross-origin resource sharing
- **HTTP Security Headers**: Helmet.js for additional security layers

---

## 📝 Future Enhancements

Potential areas for expansion:
- Real-time notifications using WebSockets
- File upload for club logos and event images
- Calendar integration (Google Calendar, Outlook)
- Mobile applications (React Native)
- Advanced analytics and reporting
- Integration with student information systems
- Payment processing for paid events
- Discussion forums for clubs

---

## 👨‍💻 Developer

**Created by Divyansh Choudhary**

This project demonstrates proficiency in:
- Full-stack JavaScript development
- Multi-tenant SaaS architecture
- RESTful API design
- Security best practices
- Modern React development
- Database design and optimization
- Third-party API integration

---

## 📄 License

This project is proprietary and created for demonstration purposes.

---

*For questions or inquiries, please contact the developer.*
