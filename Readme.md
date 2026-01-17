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

---

## ✨ Key Features

### 🔐 Authentication & Security
- **Multi-Tenant Architecture**: Complete data isolation between institutions using middleware guards
- **Secure Authentication**: JWT-based authentication with refresh tokens and secure cookie management
- **Password Management**:
  - **Forgot Password**: Secure password reset via email with time-limited tokens (15-minute expiry)
  - **Reset Password**: Token-based password reset with validation
  - **Change Password**: Users can update their passwords from profile settings
  - Password strength validation (uppercase, lowercase, numbers, minimum 8 characters)
- **Role-Based Access Control (RBAC)**: Three-tier permission system (ADMIN, CLUB_LEAD, MEMBER)
- **Security Middleware**: 
  - Rate limiting to prevent abuse
  - Helmet.js for HTTP header security
  - XSS protection and MongoDB injection prevention
  - CORS configuration for secure cross-origin requests

### 🏛️ Institution Management
- **Institution Registration**: Easy signup process with auto-generated unique institution codes
- **Email Domain Validation**: Optional email domain restrictions for institution-specific registrations
- **Global & Tenant-Specific Routes**: Flexible routing system supporting both global and institution-scoped operations

### 👥 User Management
- **User Registration**: Institution-specific user registration with email validation
- **User Profiles**: Complete profile management with account settings
- **User Administration**: 
  - View all users with search and filtering capabilities
  - Update user roles dynamically
  - Delete users with proper authorization checks
  - Self-service account deletion
- **Session Management**: Token versioning for session invalidation on password changes

### 🎯 Club Management
- **Club Creation**: Admins can create clubs with categories, descriptions, and logos
- **Club Discovery**: Browse all approved clubs with filtering and search
- **Club Membership**:
  - Request-based membership system
  - Role-based membership (Member or Club Lead)
  - Admin approval workflow for membership requests
  - Automatic approval for administrators
  - View club members and their roles
- **Club Details**: Comprehensive club pages showing members, events, and information

### 📅 Event Management
- **Event Creation**: Admins can create institution-wide or club-specific events
- **Event Registration**: 
  - Students can register for events
  - Capacity management with real-time availability tracking
  - **Conflict Detection**: 
    - Prevents scheduling overlapping events for the same club
    - Prevents users from registering for conflicting events
    - Institution-wide time conflict detection
- **Event Discovery**: Browse upcoming events with pagination
- **Event Tracking**: View personal event registrations and history

### 📧 Email Notifications
- **Welcome Emails**: Sent to institution admins upon registration
- **Password Reset Emails**: Secure reset links with expiration
- **Password Change Confirmations**: Notifications when passwords are updated
- **Membership Approval Notifications**: Email alerts when club memberships are approved
- Integration with SendGrid API for reliable email delivery

### 📊 Audit & Logging
- **Comprehensive Audit Logs**: Track all administrative actions
- **Action Tracking**: Logs include user actions, IP addresses, and user agents
- **Admin Dashboard**: View recent audit logs for security and compliance

### 🔄 Automated Tasks
- **Cron Jobs**: Automated cleanup of past events (runs daily at midnight)
- **Background Processing**: Non-blocking audit logging and email sending

### 🎨 User Interface
- **Modern Design**: Glassmorphism UI with premium, responsive design
- **Responsive Layout**: Works seamlessly across desktop, tablet, and mobile devices
- **Intuitive Navigation**: Role-based navigation and protected routes
- **User Experience**: Focus on usability and accessibility

---

## 🛠️ Technical Stack

### Frontend
- **React.js** (v18.2.0) - Modern UI library for building interactive interfaces
- **React Router** (v6.22.1) - Client-side routing with protected routes
- **Axios** (v1.6.7) - HTTP client for API communication
- **Vite** (v5.1.4) - Fast build tool and development server
- **Custom CSS** - Tailwind-inspired design system with glassmorphism effects

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** (v4.22.1) - RESTful API framework
- **MongoDB** with **Mongoose** (v8.20.1) - Flexible NoSQL database with ODM
- **JWT** (jsonwebtoken v9.0.2) - Secure token-based authentication
- **bcryptjs** (v3.0.3) - Password hashing and secure token storage

### Security & Middleware
- **Helmet.js** (v8.1.0) - HTTP security headers
- **express-rate-limit** (v8.2.1) - Rate limiting to prevent abuse
- **express-mongo-sanitize** (v2.2.0) - MongoDB injection prevention
- **xss-clean** (v0.1.4) - XSS attack prevention
- **hpp** (v0.2.3) - HTTP parameter pollution protection
- **cookie-parser** (v1.4.7) - Secure cookie management

### External Services
- **SendGrid API** (@sendgrid/mail v8.1.6) - Email delivery service
- **node-cron** (v4.2.1) - Scheduled task automation

### Development Tools
- **Nodemon** (v3.1.11) - Auto-restart development server
- **Morgan** (v1.10.1) - HTTP request logger
- **ESLint** - Code quality and consistency

---

## ⚡ Technical Highlights

This project demonstrates advanced software engineering practices:

1. **Multi-Tenant SaaS Architecture**: Implemented a sophisticated multi-tenant system similar to how Slack or Discord works, where one codebase serves multiple universities with complete data isolation using middleware guards and institution-scoped queries.

2. **Enterprise-Grade Security**: 
   - Bank-grade security practices including Role-Based Access Control (RBAC)
   - Secure JWT authentication with refresh tokens
   - Password reset with cryptographically secure tokens (48-byte hex)
   - Rate limiting, XSS protection, and MongoDB injection prevention
   - Session invalidation on password changes

3. **Scalable Design Patterns**:
   - RESTful API architecture
   - Middleware-based request processing
   - Database indexing for performance
   - Pagination for large datasets

4. **Real-World Problem Solving**:
   - Conflict detection algorithms for event scheduling
   - Automated email notifications via SendGrid
   - Background job processing with cron
   - Comprehensive audit logging for compliance

5. **Modern Development Practices**:
   - Clean code architecture with separation of concerns
   - Error handling middleware
   - Input validation and sanitization
   - Responsive, modern UI design

---

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

