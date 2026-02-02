import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import AppHeader from './AppHeader';
import './Layout.css';

const Layout = () => {
    return (
        <div className="app-layout">
            <AppHeader />
            <Sidebar />
            <main className="main-content">
                <Outlet />
                {/* Global spacer to ensure content ends above BottomNav on mobile */}
                <div className="mobile-layout-spacer" />
            </main>
            <BottomNav />
        </div>
    );
};

export default Layout;
