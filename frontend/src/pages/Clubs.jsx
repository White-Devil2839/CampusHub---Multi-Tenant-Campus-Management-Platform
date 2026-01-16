import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import Button from '../components/Button';

import '../styles/clubs.css';

const Clubs = () => {
  const { institutionCode } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [institutionCode]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clubsRes, membershipsRes] = await Promise.all([
        api.get(`/${institutionCode}/clubs`),
        api.get(`/${institutionCode}/me/memberships`)
      ]);
      setClubs(clubsRes.data);
      setMemberships(membershipsRes.data);
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  const getMembershipStatus = (clubId) => {
    return memberships.find(m => m.clubId._id === clubId);
  };

  const handleJoin = async (clubId, requestedRole = 'MEMBER') => {
    try {
      const { data } = await api.post(`/${institutionCode}/clubs/${clubId}/join`, { requestedRole });
      setMessage({ type: 'success', text: data.message || 'Join request sent!' });
      fetchData();
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error joining club' 
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  const getClubButton = (club) => {
    const membership = getMembershipStatus(club._id);

    if (membership) {
      switch (membership.status) {
        case 'PENDING':
          return (
            <div className="club-status pending">
              <span className="status-icon">⏳</span>
              <span>Request Pending</span>
            </div>
          );
        case 'APPROVED':
          return (
            <Button onClick={() => navigate(`/${institutionCode}/clubs/${club._id}`)} className="w-full">
              View Club
            </Button>
          );
        case 'REJECTED':
          return (
            <div className="club-status rejected">
              <span className="status-icon">✗</span>
              <span>Request Rejected</span>
            </div>
          );
        default:
          return null;
      }
    }

    // No membership - show join options
    if (isAdmin) {
      return (
        <Button onClick={() => handleJoin(club._id)} className="w-full">
          Join as Admin
        </Button>
      );
    }

    return (
      <div className="join-options">
        <Button onClick={() => handleJoin(club._id, 'MEMBER')} className="w-full">
          Join as Member
        </Button>
        <button 
          onClick={() => handleJoin(club._id, 'CLUB_LEAD')} 
          className="join-lead-link"
        >
          Apply as Club Lead
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="clubs-container">
        <div className="clubs-loading">Loading clubs...</div>
      </div>
    );
  }

  return (
    <div className="clubs-container">
      <div className="clubs-header">
        <h1 className="clubs-title">Clubs</h1>
        <p className="clubs-subtitle">Explore and join student organizations</p>
      </div>

      {message.text && (
        <div className={`clubs-message ${message.type}`}>
          {message.text}
        </div>
      )}

      {clubs.length === 0 ? (
        <div className="clubs-empty">
          <div className="empty-icon">🎭</div>
          <h3>No clubs yet</h3>
          <p>Check back later for new clubs!</p>
        </div>
      ) : (
        <div className="clubs-grid">
          {clubs.map((club) => (
            <div key={club._id} className="club-card">
              <div className="club-card-header">
                {club.logo ? (
                  <img 
                    src={club.logo} 
                    alt={`${club.name} logo`} 
                    className="club-logo"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="club-logo-fallback" 
                  style={{ display: club.logo ? 'none' : 'flex' }}
                >
                  {club.name.charAt(0).toUpperCase()}
                </div>
                <span className={`club-category ${club.category.toLowerCase()}`}>
                  {club.category.replace('_', '-')}
                </span>
              </div>
              
              <div className="club-card-body">
                <h2 className="club-name">{club.name}</h2>
                <p className="club-description">
                  {club.description || 'No description available'}
                </p>
              </div>
              
              <div className="club-card-footer">
                {getClubButton(club)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Clubs;
