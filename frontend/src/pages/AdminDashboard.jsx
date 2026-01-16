import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import Card from '../components/Card';
import Button from '../components/Button';

import '../styles/admin.css';

const AdminDashboard = () => {
  const { institutionCode } = useParams();
  const [requests, setRequests] = useState([]);
  const [clubData, setClubData] = useState({ name: '', category: 'TECH', description: '', logo: '' });
  const [eventData, setEventData] = useState({ title: '', description: '', date: '', endTime: '', location: '', capacity: '', type: 'INSTITUTE', clubId: '' });
  const [clubs, setClubs] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchRequests();
    fetchClubs();
  }, [institutionCode]);

  const fetchRequests = async () => {
    try {
      const res = await api.get(`/${institutionCode}/admin/requests`);
      setRequests(res.data);
    } catch (error) {
      console.error('Error fetching requests', error);
    }
  };

  const fetchClubs = async () => {
    try {
      const res = await api.get(`/${institutionCode}/clubs`);
      setClubs(res.data);
    } catch (error) {
      console.error('Error fetching clubs', error);
    }
  };

  const handleRequest = async (id, status) => {
    try {
      await api.patch(`/${institutionCode}/admin/requests/${id}`, { status });
      fetchRequests();
      setMessage({ type: 'success', text: `Request ${status.toLowerCase()} successfully!` });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating request' });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/${institutionCode}/admin/clubs`, clubData);
      setMessage({ type: 'success', text: 'Club created successfully!' });
      setClubData({ name: '', category: 'TECH', description: '', logo: '' });
      fetchClubs();
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error creating club' });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/${institutionCode}/admin/events`, eventData);
      setMessage({ type: 'success', text: 'Event created successfully!' });
      setEventData({ title: '', description: '', date: '', endTime: '', location: '', capacity: '', type: 'INSTITUTE', clubId: '' });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error creating event' });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const { user } = useContext(AuthContext);

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
           <p className="dashboard-subtitle">Admin Dashboard - Manage clubs, events, and requests</p>
        </div>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Pending Requests */}
      <div className="section-container">
        <h2 className="section-title mb-4">Pending Membership Requests</h2>
        {requests.length === 0 ? (
          <p className="text-gray-500">No pending requests.</p>
        ) : (
          <div className="admin-table-container">
             <table className="admin-table">
               <thead>
                 <tr>
                    <th>User</th>
                    <th>Club</th>
                    <th>Requested Role</th>
                    <th>Actions</th>
                 </tr>
               </thead>
               <tbody>
                {requests.map((req) => (
                  <tr key={req._id}>
                    <td>
                      <div>
                        <div className="font-medium">{req.userId.name}</div>
                        <div className="text-sm text-gray-500">{req.userId.email}</div>
                      </div>
                    </td>
                    <td>{req.clubId.name}</td>
                    <td>
                      <span className={`badge ${req.requestedRole === 'CLUB_LEAD' ? 'badge-warning' : 'badge-info'}`}>
                        {req.requestedRole === 'CLUB_LEAD' ? 'Club Lead' : 'Member'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Button variant="success" className="btn-sm" onClick={() => handleRequest(req._id, 'APPROVED')}>Approve</Button>
                        <Button variant="danger" className="btn-sm" onClick={() => handleRequest(req._id, 'REJECTED')}>Reject</Button>
                      </div>
                    </td>
                  </tr>
                ))}
               </tbody>
             </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Club */}
        <div className="admin-form-container">
          <h2 className="text-xl font-bold mb-6">Create New Club</h2>
          <form onSubmit={handleCreateClub} className="flex flex-col gap-4">
            <input className="input" placeholder="Club Name" value={clubData.name} onChange={(e) => setClubData({ ...clubData, name: e.target.value })} required />
            <select className="input" value={clubData.category} onChange={(e) => setClubData({ ...clubData, category: e.target.value })}>
              <option value="TECH">Tech</option>
              <option value="NON_TECH">Non-Tech</option>
              <option value="EXTRACURRICULAR">Extracurricular</option>
            </select>
            <textarea className="input" rows="3" placeholder="Description" value={clubData.description} onChange={(e) => setClubData({ ...clubData, description: e.target.value })} />
            <input className="input" placeholder="Logo URL" value={clubData.logo} onChange={(e) => setClubData({ ...clubData, logo: e.target.value })} />
            <Button type="submit">Create Club</Button>
          </form>
        </div>

        {/* Create Event */}
        <div className="admin-form-container">
          <h2 className="text-xl font-bold mb-6">Create New Event</h2>
          <form onSubmit={handleCreateEvent} className="flex flex-col gap-4">
            <input className="input" placeholder="Event Title" value={eventData.title} onChange={(e) => setEventData({ ...eventData, title: e.target.value })} required />
            <textarea className="input" rows="2" placeholder="Description" value={eventData.description} onChange={(e) => setEventData({ ...eventData, description: e.target.value })} />
            
            <div className="form-row">
              <div>
                <label className="label">Start Time</label>
                <input className="input" type="datetime-local" value={eventData.date} onChange={(e) => setEventData({ ...eventData, date: e.target.value })} required />
              </div>
              <div>
                <label className="label">End Time</label>
                <input className="input" type="datetime-local" value={eventData.endTime} onChange={(e) => setEventData({ ...eventData, endTime: e.target.value })} required />
              </div>
            </div>
            
            <div className="form-row">
                <input className="input" placeholder="Location" value={eventData.location} onChange={(e) => setEventData({ ...eventData, location: e.target.value })} required />
                <input className="input" type="number" placeholder="Capacity" min="1" value={eventData.capacity} onChange={(e) => setEventData({ ...eventData, capacity: e.target.value })} required />
            </div>
            
            <select className="input" value={eventData.type} onChange={(e) => setEventData({ ...eventData, type: e.target.value })}>
              <option value="INSTITUTE">Institute Level</option>
              <option value="CLUB">Club Level</option>
            </select>
            
            {eventData.type === 'CLUB' && (
              <select className="input" value={eventData.clubId} onChange={(e) => setEventData({ ...eventData, clubId: e.target.value })} required>
                <option value="">Select Club</option>
                {clubs.map((club) => (
                  <option key={club._id} value={club._id}>{club.name}</option>
                ))}
              </select>
            )}
            <Button type="submit">Create Event</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
