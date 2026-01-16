# CampusHub

**CampusHub is the digital operating system for university student communities.**

Think of it as a "Shopify for Campus Clubs" — a platform where any educational institution can sign up and instantly launch their own dedicated portal for managing specialized clubs, events, and student memberships.

## 💡 The Problem
Managing student life is chaos. Colleges rely on scattered Google Forms, email threads, and notice boards to coordinate thousands of students and dozens of clubs. It's unorganized, insecure, and hard to track.

## 🚀 The Solution
I built CampusHub to bring order to this chaos. It handles the complex workflows of a university campus in a unified, beautiful interface.

**What creates value:**
*   **For Administrators**: A powerful command center to oversee all club activities, approve requests with a click, and audit actions.
*   **For Club Leads**: Tools to manage rosters, schedule events without time conflicts, and engage members.
*   **For Students**: A single place to discover communities and join them.

## ⚡ Technical Highlights (For Recruiters)
This isn't just a simple website; it's a **Multi-Tenant SaaS Application**.
*   **Architecture**: I implemented a **Multi-Tenant** architecture (similar to how Slack or Discord works). One codebase serves multiple universities, but each university's data is strictly isolated using Middleware Guards.
*   **Security**: Bank-grade security practices including **Role-Based Access Control (RBAC)** (ensuring students can't access admin features) and secure **JWT Authentication**.
*   **Design**: Built with a focus on **User Experience**. I moved away from boring dashboards and designed a modern "Glassmorphism" UI that feels premium and responsive.
*   **Real-World Features**: Includes automated email notifications (via SendGrid) and conflict-detection algorithms for event planning.

## 🛠️ Tech Stack
*   **Frontend**: React.js, Tailwind CSS (Custom Design System), React Router
*   **Backend**: Node.js, Express.js (RESTful API)
*   **Database**: MongoDB (Mongoose), tailored for flexible schema design
*   **DevOps/Tools**: Git, Postman, SendGrid API

## 💻 How to Run This Project
If you want to spin this up locally to test features:

1.  **Clone the repo**
    ```bash
    git clone <repository_url>
    cd multi-tenant
    ```

2.  **Setup Backend**
    *   `cd backend`
    *   `npm install`
    *   Create a `.env` file with your Mongo URI and JWT Secret.
    *   `npm run dev`

3.  **Setup Frontend**
    *   `cd ../frontend`
    *   `npm install`
    *   `npm run dev`

The app will launch at `http://localhost:5173`. You can register a new Institution at `/institution/signup` to see the multi-tenancy in action.

---
*Created by Divyansh Choudhary.*
