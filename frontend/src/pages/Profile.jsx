import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    FiLogOut,
    FiUser,
    FiMail,
    FiShield,
    FiSettings,
    FiLock,
    FiInfo,
    FiSun,
    FiMoon,
    FiMonitor,
    FiZap,
    FiSmartphone,
    FiGlobe,
    FiCheckCircle,
    FiCalendar,
    FiBriefcase,
    FiChevronRight
} from 'react-icons/fi';
import './Profile.css';

const Profile = () => {
    const { user, logout } = useAuth();

    // Settings state (persisted to localStorage)
    const [themeMode, setThemeMode] = useState(() => {
        return localStorage.getItem('themeMode') || 'system';
    });
    const [animations, setAnimations] = useState(() => {
        return localStorage.getItem('animations') !== 'false';
    });
    const [hapticFeedback, setHapticFeedback] = useState(() => {
        return localStorage.getItem('hapticFeedback') !== 'false';
    });

    // Save settings to localStorage
    useEffect(() => {
        localStorage.setItem('themeMode', themeMode);
    }, [themeMode]);

    useEffect(() => {
        localStorage.setItem('animations', animations);
    }, [animations]);

    useEffect(() => {
        localStorage.setItem('hapticFeedback', hapticFeedback);
    }, [hapticFeedback]);

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
        }
    };

    const getMemberSince = () => {
        // Placeholder - would come from user data in real app
        return 'January 2024';
    };

    const getThemeIcon = () => {
        switch (themeMode) {
            case 'light': return <FiSun />;
            case 'dark': return <FiMoon />;
            default: return <FiMonitor />;
        }
    };

    return (
        <div className="profile-page">
            {/* Page Header (Desktop Only) */}
            <div className="page-header">
                <h1 className="page-title">My Profile</h1>
                <p className="page-subtitle">Manage your account and settings</p>
            </div>

            {/* ===== SECTION 1: PROFILE HEADER ===== */}
            <div className="profile-hero-card">
                <div className="profile-hero-avatar">
                    <FiUser size={36} />
                </div>
                <div className="profile-hero-info">
                    <h2 className="profile-hero-name">{user?.username || 'User'}</h2>
                    <div className="profile-hero-meta">
                        <span className={`role-badge ${user?.role === 'admin' ? 'admin' : 'staff'}`}>
                            {user?.role?.toUpperCase() || 'STAFF'}
                        </span>
                        <span className="status-indicator active">
                            <FiCheckCircle size={12} /> Active
                        </span>
                    </div>
                </div>
            </div>

            {/* ===== SECTION 2: ACCOUNT INFORMATION ===== */}
            <div className="profile-section-card">
                <div className="section-header">
                    <FiUser className="section-icon" />
                    <h3>Account Information</h3>
                </div>
                <div className="info-list">
                    <div className="info-row">
                        <div className="info-icon"><FiMail /></div>
                        <div className="info-content">
                            <span className="info-label">Username / Email</span>
                            <span className="info-value">{user?.username || 'N/A'}</span>
                        </div>
                    </div>
                    <div className="info-row">
                        <div className="info-icon"><FiShield /></div>
                        <div className="info-content">
                            <span className="info-label">Access Level</span>
                            <span className="info-value">{user?.role?.toUpperCase() || 'STAFF'}</span>
                        </div>
                    </div>
                    <div className="info-row">
                        <div className="info-icon"><FiBriefcase /></div>
                        <div className="info-content">
                            <span className="info-label">Shop Name</span>
                            <span className="info-value">Sri Vari & Co</span>
                        </div>
                    </div>
                    <div className="info-row">
                        <div className="info-icon"><FiCalendar /></div>
                        <div className="info-content">
                            <span className="info-label">Member Since</span>
                            <span className="info-value">{getMemberSince()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== SECTION 3: CUSTOMIZATION & SETTINGS ===== */}
            <div className="profile-section-card">
                <div className="section-header">
                    <FiSettings className="section-icon" />
                    <h3>Customization</h3>
                </div>
                <div className="settings-list">
                    {/* Theme Mode */}
                    <div className="setting-row">
                        <div className="setting-icon">{getThemeIcon()}</div>
                        <div className="setting-content">
                            <span className="setting-label">Theme Mode</span>
                            <span className="setting-desc">Choose your preferred theme</span>
                        </div>
                        <div className="theme-selector">
                            <button
                                className={`theme-btn ${themeMode === 'light' ? 'active' : ''}`}
                                onClick={() => setThemeMode('light')}
                                title="Light"
                            >
                                <FiSun />
                            </button>
                            <button
                                className={`theme-btn ${themeMode === 'dark' ? 'active' : ''}`}
                                onClick={() => setThemeMode('dark')}
                                title="Dark"
                            >
                                <FiMoon />
                            </button>
                            <button
                                className={`theme-btn ${themeMode === 'system' ? 'active' : ''}`}
                                onClick={() => setThemeMode('system')}
                                title="System"
                            >
                                <FiMonitor />
                            </button>
                        </div>
                    </div>

                    {/* Animations Toggle */}
                    <div className="setting-row">
                        <div className="setting-icon"><FiZap /></div>
                        <div className="setting-content">
                            <span className="setting-label">Animations</span>
                            <span className="setting-desc">Enable smooth transitions</span>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={animations}
                                onChange={(e) => setAnimations(e.target.checked)}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    {/* Haptic Feedback Toggle */}
                    <div className="setting-row">
                        <div className="setting-icon"><FiSmartphone /></div>
                        <div className="setting-content">
                            <span className="setting-label">Haptic Feedback</span>
                            <span className="setting-desc">Vibration on touch</span>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={hapticFeedback}
                                onChange={(e) => setHapticFeedback(e.target.checked)}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    {/* Language (Future-ready) */}
                    <div className="setting-row clickable">
                        <div className="setting-icon"><FiGlobe /></div>
                        <div className="setting-content">
                            <span className="setting-label">Language</span>
                            <span className="setting-desc">English (US)</span>
                        </div>
                        <FiChevronRight className="setting-arrow" />
                    </div>
                </div>
            </div>

            {/* ===== SECTION 4: SECURITY & PRIVACY ===== */}
            <div className="profile-section-card">
                <div className="section-header">
                    <FiLock className="section-icon" />
                    <h3>Security & Privacy</h3>
                </div>
                <div className="settings-list">
                    <div className="setting-row clickable">
                        <div className="setting-icon"><FiLock /></div>
                        <div className="setting-content">
                            <span className="setting-label">Change Password</span>
                            <span className="setting-desc">Update your password</span>
                        </div>
                        <FiChevronRight className="setting-arrow" />
                    </div>
                </div>

                <div className="logout-section">
                    <button className="logout-btn" onClick={handleLogout}>
                        <FiLogOut /> Logout
                    </button>
                    <p className="logout-warning">You will need to login again after logging out.</p>
                </div>
            </div>

            {/* ===== SECTION 5: APP INFORMATION ===== */}
            <div className="profile-section-card app-info-section">
                <div className="section-header">
                    <FiInfo className="section-icon" />
                    <h3>About</h3>
                </div>
                <div className="app-info-content">
                    <div className="app-version">
                        <span className="version-label">Version</span>
                        <span className="version-value">v2.1.0</span>
                    </div>
                    <p className="app-copyright">
                        © {new Date().getFullYear()} Sri Vari & Co
                    </p>
                    <p className="app-tagline">Premium Business Management</p>
                </div>
            </div>
        </div>
    );
};

export default Profile;
