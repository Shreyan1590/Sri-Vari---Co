import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import './Layout.css';

const Layout = () => {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <Outlet />
            </main>
            <BottomNav />
        </div>
    );
};

export default Layout;
