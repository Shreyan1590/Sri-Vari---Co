import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    LineChart, Line,
    ResponsiveContainer
} from 'recharts';
import { FiCalendar, FiTrendingUp, FiPieChart, FiBarChart2 } from 'react-icons/fi';
import './Analytics.css';

const COLORS = {
    primary: '#667eea',
    success: '#48bb78',
    warning: '#f6ad55',
    danger: '#fc8181',
    info: '#63b3ed',
    purple: '#764ba2'
};

const Analytics = () => {
    const [summary, setSummary] = useState(null);
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Generate year options (last 5 years)
    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    useEffect(() => {
        fetchData();
    }, [selectedYear]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [summaryRes, monthlyRes] = await Promise.all([
                analyticsAPI.getSummary(),
                analyticsAPI.getMonthly(selectedYear)
            ]);

            setSummary(summaryRes.data.data);
            setMonthlyData(monthlyRes.data.data);
        } catch (err) {
            console.error('Failed to load analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    // Format currency for tooltips
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    };

    // Pie chart data
    const pieData = summary ? [
        { name: 'In Stock', value: summary.inStock, color: COLORS.info },
        { name: 'Sold', value: summary.sold, color: COLORS.success }
    ] : [];

    // Custom tooltip for bar chart
    const CustomBarTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-label">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }}>
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Custom tooltip for line chart
    const CustomLineTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const value = payload[0].value;
            const isPositive = value >= 0;
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-label">{label}</p>
                    <p style={{ color: isPositive ? COLORS.success : COLORS.danger }}>
                        Profit: {isPositive ? '' : '-'}{formatCurrency(Math.abs(value))}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="spinner"></div>
                <p>Loading analytics...</p>
            </div>
        );
    }

    return (
        <div className="analytics">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Analytics</h1>
                    <p className="page-subtitle">Visualize your business performance</p>
                </div>
                <div className="filter-group">
                    <FiCalendar />
                    <select
                        className="form-input form-select"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    >
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="charts-grid">
                {/* Pie Chart - Stock vs Sold */}
                <div className="card chart-card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <FiPieChart className="title-icon" />
                            Stock Distribution
                        </h3>
                    </div>
                    <div className="chart-container pie-chart-container">
                        {pieData.every(d => d.value === 0) ? (
                            <div className="no-data">
                                <p>No data available</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [value, 'Count']} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                    <div className="pie-legend">
                        <div className="legend-item">
                            <span className="legend-dot" style={{ background: COLORS.info }}></span>
                            <span>In Stock: {summary?.inStock || 0}</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-dot" style={{ background: COLORS.success }}></span>
                            <span>Sold: {summary?.sold || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Bar Chart - Monthly Purchases vs Sales */}
                <div className="card chart-card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <FiBarChart2 className="title-icon" />
                            Monthly Purchases vs Sales
                        </h3>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                                <XAxis dataKey="month" stroke="#a0aec0" />
                                <YAxis stroke="#a0aec0" />
                                <Tooltip content={<CustomBarTooltip />} />
                                <Legend />
                                <Bar dataKey="purchases" name="Purchases" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="sales" name="Sales" fill={COLORS.success} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Line Chart - Profit Trend */}
                <div className="card chart-card full-width">
                    <div className="card-header">
                        <h3 className="card-title">
                            <FiTrendingUp className="title-icon" />
                            Monthly Profit Trend
                        </h3>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                                <XAxis dataKey="month" stroke="#a0aec0" />
                                <YAxis stroke="#a0aec0" tickFormatter={(value) => `₹${value / 1000}k`} />
                                <Tooltip content={<CustomLineTooltip />} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="profit"
                                    name="Profit"
                                    stroke={COLORS.purple}
                                    strokeWidth={3}
                                    dot={{ fill: COLORS.purple, strokeWidth: 2, r: 5 }}
                                    activeDot={{ r: 8, stroke: COLORS.purple, strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue Bar Chart */}
                <div className="card chart-card full-width">
                    <div className="card-header">
                        <h3 className="card-title">
                            <FiBarChart2 className="title-icon" />
                            Monthly Revenue vs Investment
                        </h3>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                                <XAxis dataKey="month" stroke="#a0aec0" />
                                <YAxis stroke="#a0aec0" tickFormatter={(value) => `₹${value / 1000}k`} />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                                <Bar dataKey="purchaseAmount" name="Investment" fill={COLORS.warning} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="salesAmount" name="Revenue" fill={COLORS.success} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
