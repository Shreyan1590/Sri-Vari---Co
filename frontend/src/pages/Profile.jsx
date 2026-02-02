import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser, FiMail, FiShield } from 'react-icons/fi';
import './Profile.css';

const Profile = () => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
        }
    };

    return (
        <div className="profile-page">
            <div className="page-header">
                <h1 className="page-title">My Profile</h1>
                <p className="page-subtitle">Manage your account and settings</p>
            </div>

            <div className="profile-card card">
                <div className="profile-header">
                    <div className="profile-avatar">
                        <FiUser size={40} />
                    </div>
                    <div className="profile-main-info">
                        <h2>{user?.username || 'User Name'}</h2>
                        <span className="badge badge-info">{user?.role || 'staff'}</span>
                    </div>
                </div>

                <div className="profile-details">
                    <div className="detail-item">
                        <div className="detail-icon"><FiMail /></div>
                        <div className="detail-content">
                            <label>Email / Username</label>
                            <span>{user?.username || 'N/A'}</span>
                        </div>
                    </div>
                    <div className="detail-item">
                        <div className="detail-icon"><FiShield /></div>
                        <div className="detail-content">
                            <label>Access Level</label>
                            <span>{user?.role?.toUpperCase() || 'STAFF'}</span>
                        </div>
                    </div>
                </div>

                <div className="profile-actions">
                    <button className="btn btn-danger logout-full-btn" onClick={handleLogout}>
                        <FiLogOut /> Logout
                    </button>
                </div>
            </div>

            <div className="app-info-card card mt-24">
                <h3>App Version</h3>
                <p>v2.1.0 (Mobile Optimized)</p>
                <small>© 2024 Sri Vari & Co</small>
            </div>
        </div>
    );
};

export default Profile;
