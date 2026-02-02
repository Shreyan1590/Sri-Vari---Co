import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiPackage, FiBarChart2, FiUser } from 'react-icons/fi';
import './BottomNav.css';

const BottomNav = () => {
    return (
        <nav className="bottom-nav">
            <NavLink to="/dashboard" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
                <FiHome className="bottom-nav-icon" />
                <span>Home</span>
            </NavLink>
            <NavLink to="/inventory" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
                <FiPackage className="bottom-nav-icon" />
                <span>Inventory</span>
            </NavLink>
            <NavLink to="/analytics" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
                <FiBarChart2 className="bottom-nav-icon" />
                <span>Analytics</span>
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
                <FiUser className="bottom-nav-icon" />
                <span>Profile</span>
            </NavLink>
        </nav>
    );
};

export default BottomNav;
