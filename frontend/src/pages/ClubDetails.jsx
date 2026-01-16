import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import '../styles/clubs.css';

const ClubDetails = () => {
    const { institutionCode, clubId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [club, setClub] = useState(null);
    const [members, setMembers] = useState([]);
    const [events, setEvents] = useState([]);
    const [membership, setMembership] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    const isAdmin = user?.role === 'ADMIN';

    useEffect(() => {
        fetchClubData();
    }, [clubId]);

    const fetchClubData = async () => {
        setLoading(true);
        try {
            const [clubRes, membersRes, eventsRes, membershipRes] = await Promise.all([
                api.get(`/${institutionCode}/clubs/${clubId}`),
                api.get(`/${institutionCode}/clubs/${clubId}/members`),
                api.get(`/${institutionCode}/clubs/${clubId}/events`),
                api.get(`/${institutionCode}/me/memberships`)
            ]);

            setClub(clubRes.data);
            setMembers(membersRes.data);
            setEvents(eventsRes.data);

            const myMembership = membershipRes.data.find(m => m.clubId._id === clubId);
            setMembership(myMembership);
        } catch (error) {
            console.error('Error fetching club data:', error);
            setMessage({ type: 'error', text: 'Failed to load club details' });
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (requestedRole = 'MEMBER') => {
        try {
            const { data } = await api.post(`/${institutionCode}/clubs/${clubId}/join`, { requestedRole });
            setMessage({ type: 'success', text: data.message || 'Join request sent!' });
            fetchClubData();
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Error joining club' 
            });
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        }
    };

    if (loading) {
        return (
            <div className="clubs-container">
                <div className="clubs-loading">Loading...</div>
            </div>
        );
    }

    if (!club) {
        return (
            <div className="clubs-container">
                <div className="clubs-empty">
                    <div className="empty-icon">🔍</div>
                    <h3>Club not found</h3>
                    <p>This club may have been removed or doesn't exist.</p>
                    <Button onClick={() => navigate(`/${institutionCode}/clubs`)} className="mt-4">
                        Back to Clubs
                    </Button>
                </div>
            </div>
        );
    }

    const getMembershipButton = () => {
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
                        <div className="membership-approved">
                            <div className="approved-badge">
                                ✓ You are a {membership.role === 'CLUB_LEAD' ? 'Club Lead' : 'Member'}
                            </div>
                        </div>
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

        if (isAdmin) {
            return (
                <Button onClick={() => handleJoin()} className="w-full">
                    Join as Admin
                </Button>
            );
        }

        return (
            <div className="join-options">
                <Button onClick={() => handleJoin('MEMBER')} className="w-full">
                    Join as Member
                </Button>
                <button 
                    onClick={() => handleJoin('CLUB_LEAD')} 
                    className="join-lead-link"
                >
                    Apply as Club Lead
                </button>
            </div>
        );
    };

    return (
        <div className="clubs-container">
            {/* Back Button */}
            <Button 
                variant="outline" 
                onClick={() => navigate(`/${institutionCode}/clubs`)} 
                className="mb-6"
            >
                ← Back to Clubs
            </Button>

            {/* Club Header */}
            <div className="club-detail-header">
                <div className="club-detail-logo-container">
                    {club.logo ? (
                        <img 
                            src={club.logo} 
                            alt={`${club.name} logo`} 
                            className="club-detail-logo"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div 
                        className="club-detail-logo-fallback" 
                        style={{ display: club.logo ? 'none' : 'flex' }}
                    >
                        {club.name.charAt(0).toUpperCase()}
                    </div>
                </div>
                <div className="club-detail-info">
                    <div className="club-detail-title-row">
                        <h1 className="club-detail-name">{club.name}</h1>
                        <span className={`club-category ${club.category.toLowerCase()}`}>
                            {club.category.replace('_', '-')}
                        </span>
                    </div>
                    <p className="club-detail-description">{club.description}</p>
                </div>
            </div>

            {message.text && (
                <div className={`clubs-message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="club-detail-content">
                {/* Main Content */}
                <div className="club-detail-main">
                    {/* Events */}
                    <Card className="mb-6">
                        <h2 className="section-title">Upcoming Events</h2>
                        {events.length === 0 ? (
                            <p className="text-gray-500">No upcoming events</p>
                        ) : (
                            <div className="events-list">
                                {events.map(event => (
                                    <div key={event._id} className="event-item">
                                        <div className="event-date">
                                            <span className="event-day">
                                                {new Date(event.date).getDate()}
                                            </span>
                                            <span className="event-month">
                                                {new Date(event.date).toLocaleString('default', { month: 'short' })}
                                            </span>
                                        </div>
                                        <div className="event-details">
                                            <h3 className="event-title">{event.title}</h3>
                                            <p className="event-location">📍 {event.location}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="club-detail-sidebar">
                    <Card className="mb-6">
                        <h2 className="section-title">Join Club</h2>
                        {getMembershipButton()}
                    </Card>

                    <Card>
                        <h2 className="section-title">Members ({members.length})</h2>
                        {members.length === 0 ? (
                            <p className="text-gray-500 text-sm">No members yet</p>
                        ) : (
                            <div className="members-list">
                                {members.slice(0, 10).map(member => (
                                    <div key={member._id} className="member-item">
                                        <div className="member-avatar">
                                            {member.userId.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="member-info">
                                            <span className="member-name">{member.userId.name}</span>
                                            {member.role === 'CLUB_LEAD' && (
                                                <span className="member-badge lead">Club Lead</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {members.length > 10 && (
                                    <p className="text-sm text-gray-500 mt-2">+{members.length - 10} more members</p>
                                )}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ClubDetails;
