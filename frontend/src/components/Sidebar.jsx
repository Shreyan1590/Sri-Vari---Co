import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FiHome,
    FiPackage,
    FiBarChart2,
    FiLogOut,
    FiMenu,
    FiX,
    FiUser,
    FiRotateCcw
} from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
        { path: '/inventory', icon: FiPackage, label: 'Inventory' },
        { path: '/returns', icon: FiRotateCcw, label: 'Returns' },
        { path: '/analytics', icon: FiBarChart2, label: 'Analytics' }
    ];

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                className="mobile-menu-btn"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}

            {/* Sidebar */}
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                {/* Logo */}
                <div className="sidebar-header">
                    <div className="logo">
                        <img src="/logo.png" alt="Sri Vari & Co" className="logo-image" />
                        <div className="logo-text">
                            <span className="logo-title">Sri Vari & Co</span>
                            <span className="logo-subtitle">Mobile Shop</span>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => setIsOpen(false)}
                        >
                            <item.icon className="nav-icon" />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* User Info & Logout */}
                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">
                            <FiUser size={18} />
                        </div>
                        <div className="user-details">
                            <span className="user-name">{user?.username || 'User'}</span>
                            <span className="user-role">{user?.role || 'staff'}</span>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <FiLogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
