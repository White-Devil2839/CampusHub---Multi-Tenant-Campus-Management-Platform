import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/landing.css';

const Landing = () => {
  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="nav-content">
          <Link to="/" className="brand-link">CampusHub</Link>
          <div className="nav-links">
            <Link to="/login" className="nav-link">Log in</Link>
            <Link to="/register" className="nav-btn">Register</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>
              Manage your campus
              <span className="highlight">communities easily.</span>
            </h1>
            <p className="hero-desc">
              CampusHub connects students with clubs, events, and their institutions in one seamless platform. Simplify management and boost engagement.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg">Get Started</Link>
              <Link to="/login" className="btn btn-secondary btn-lg">Log in</Link>
            </div>
          </div>
          <div className="hero-visual">
             <div className="hero-placeholder">CH</div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="benefits-section">
        <div className="benefits-header">
          <div className="benefits-label">Benefits</div>
          <h2 className="benefits-title">Why use CampusHub?</h2>
          <p className="benefits-subtitle">
            Tailored features for both Institutions and Students to enhance the campus experience.
          </p>
        </div>

        <div className="features-grid">
           {/* Feature 1 */}
           <div className="feature-item feature-blue">
             <div className="feature-icon">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
               </svg>
             </div>
             <h3 className="feature-title">For Institutions</h3>
             <p className="feature-desc">Centralize your club management, approve events, track engagement, and manage members all from a powerful admin dashboard.</p>
           </div>

           {/* Feature 2 */}
           <div className="feature-item feature-purple">
             <div className="feature-icon">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
               </svg>
             </div>
             <h3 className="feature-title">For Students</h3>
             <p className="feature-desc">Join your institution using a unique code, discover clubs, register for events, and stay updated with everything happening on campus.</p>
           </div>
           
           {/* Feature 3 */}
           <div className="feature-item feature-pink">
             <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
             </div>
             <h3 className="feature-title">Event Management</h3>
             <p className="feature-desc">Seamlessly create, promote, and manage registrations for campus events in real-time.</p>
           </div>

           {/* Feature 4 */}
           <div className="feature-item feature-teal">
             <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
             </div>
             <h3 className="feature-title">Secure & Private</h3>
             <p className="feature-desc">Each institution has its own isolated environment. Your data is secure, private, and inaccessible to others.</p>
           </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
           <div className="footer-brand">CampusHub</div>
           <div className="footer-text">
             &copy; {new Date().getFullYear()} CampusHub. All rights reserved.
           </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
