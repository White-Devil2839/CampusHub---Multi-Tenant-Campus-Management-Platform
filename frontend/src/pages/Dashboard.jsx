import React, { useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Button from '../components/Button';

import '../styles/dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { institutionCode } = useParams();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="dashboard-container">
      <div className="section-container">
        <div>
           <h1 className="dashboard-title">{getGreeting()}, {user?.name}!</h1>
           <p className="dashboard-subtitle">Everything happening at your campus, all in one place.</p>
        </div>
        <div className="hidden md:block text-right">
           <p className="text-sm text-gray-500 font-medium tracking-wide uppercase">Current Role</p>
           <p className="text-xl font-bold text-primary">{user?.role === 'MEMBER' ? 'Student' : user?.role}</p>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Clubs Card */}
        <div className="stat-card group">
            <div className="card-header">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    🎭
                </div>
            </div>
            <h3 className="card-title mb-2">Clubs & Societies</h3>
            <div className="card-body">
                Explore student organizations, join communities, and find your passion.
            </div>
            <Link to={`/${institutionCode}/clubs`} className="mt-auto">
                <Button className="w-full">Explore Clubs</Button>
            </Link>
        </div>

        {/* Events Card */}
        <div className="stat-card group">
             <div className="card-header">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    📅
                </div>
            </div>
          <h3 className="card-title mb-2">Upcoming Events</h3>
          <div className="card-body">
            Stay updated with workshops, seminars, and cultural fests happening on campus.
          </div>
          <Link to={`/${institutionCode}/events`} className="mt-auto">
            <Button variant="secondary" className="w-full">View Calendar</Button>
          </Link>
        </div>

        {/* Profile Card */}
        <div className="stat-card group">
             <div className="card-header">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    👤
                </div>
            </div>
          <h3 className="card-title mb-2">My Profile</h3>
          <div className="card-body">
            Manage your memberships, view your event registrations, and settings.
          </div>
          <Link to={`/${institutionCode}/profile`} className="mt-auto">
            <Button variant="outline" className="w-full">My Dashboard</Button>
          </Link>
        </div>

        {/* Admin Card - Only for Admins */}
        {user?.role === 'ADMIN' && (
          <div className="stat-card group border-orange-200 bg-orange-50">
             <div className="card-header">
                <div className="w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    ⚡
                </div>
            </div>
            <h3 className="card-title mb-2 text-orange-900">Admin Console</h3>
            <div className="card-body text-orange-800">
              Manage clubs, approve membership requests, and oversee institution activities.
            </div>
            <Link to={`/${institutionCode}/admin`} className="mt-auto">
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white border-none">
                Access Admin
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
