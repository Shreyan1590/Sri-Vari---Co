import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mobilesAPI } from '../services/api';
import {
    FiPlus,
    FiSearch,
    FiEdit2,
    FiTrash2,
    FiX,
    FiFilter,
    FiPhone
} from 'react-icons/fi';
import Skeleton, { InventoryCardSkeleton } from '../components/Skeleton';
import './Inventory.css';

const Inventory = () => {
    const [searchParams] = useSearchParams();
    const [mobiles, setMobiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showSellModal, setShowSellModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedMobile, setSelectedMobile] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        serialNo: '',
        purchaseDate: '',
        modelName: '',
        imei1: '',
        imei2: '',
        purchaseAmount: '',
        ramRom: '',
        seller: ''
    });

    const [sellData, setSellData] = useState({
        salesDate: '',
        salesAmount: ''
    });

    // Edit form data
    const [editFormData, setEditFormData] = useState({
        serialNo: '',
        purchaseDate: '',
        modelName: '',
        imei1: '',
        imei2: '',
        purchaseAmount: '',
        ramRom: '',
        seller: '',
        salesDate: '',
        salesAmount: '',
        status: ''
    });

    useEffect(() => {
        if (searchParams.get('action') === 'add') {
            setShowAddModal(true);
        }
        fetchMobiles();
    }, [statusFilter, searchParams]);

    const fetchMobiles = async () => {
        try {
            setLoading(true);
            const params = {};
            if (statusFilter) params.status = statusFilter;
            if (searchTerm) params.search = searchTerm;

            const response = await mobilesAPI.getAll(params);
            setMobiles(response.data.data);
        } catch (err) {
            setError('Failed to load mobiles');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchMobiles();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // ========================================
    // CIPHER CONVERSION LOGIC
    // ========================================
    // Explicit dictionary-based lookup - NO index calculations
    // 
    // Letter → Number mapping:
    // Z → 1, Y → 2, X → 3, W → 4, V → 5
    // U → 6, T → 7, S → 8, R → 9, Q → 0
    //
    // Number → Letter mapping (reverse):
    // 1 → Z, 2 → Y, 3 → X, 4 → W, 5 → V
    // 6 → U, 7 → T, 8 → S, 9 → R, 0 → Q
    // ========================================

    // Letter to Number mapping (case-insensitive)
    const letterToNumber = {
        'Z': '1', 'z': '1',
        'Y': '2', 'y': '2',
        'X': '3', 'x': '3',
        'W': '4', 'w': '4',
        'V': '5', 'v': '5',
        'U': '6', 'u': '6',
        'T': '7', 't': '7',
        'S': '8', 's': '8',
        'R': '9', 'r': '9',
        'Q': '0', 'q': '0'
    };

    // Number to Letter mapping
    const numberToLetter = {
        '1': 'Z',
        '2': 'Y',
        '3': 'X',
        '4': 'W',
        '5': 'V',
        '6': 'U',
        '7': 'T',
        '8': 'S',
        '9': 'R',
        '0': 'Q'
    };

    /**
     * Decode cipher text to numeric value
     * Converts letters (Z-Q) to numbers using explicit lookup
     * Passes through existing numbers unchanged
     * Skips invalid characters
     * 
     * Test cases:
     * - "ZYX" → 123 (Z=1, Y=2, X=3)
     * - "Y" → 2 (NOT 4, this was the bug)
     * - "ZVQQQ" → 15000 (Z=1, V=5, Q=0, Q=0, Q=0)
     * - "123" → 123 (numbers pass through)
     * - "Z2W" → 124 (Z=1, 2=2, W=4)
     */
    const decodeCipher = (text) => {
        if (!text) return 0;
        let decoded = '';
        for (const char of text.toString()) {
            if (letterToNumber[char]) {
                // Convert letter to number using lookup
                decoded += letterToNumber[char];
            } else if (/\d/.test(char)) {
                // Keep existing numbers as-is
                decoded += char;
            }
            // Skip invalid characters (symbols, spaces)
        }
        return parseInt(decoded) || 0;
    };

    /**
     * Encode numeric value to cipher text
     * Converts numbers to letters using explicit lookup
     * 
     * Test cases:
     * - "123" → "ZYX"
     * - "2" → "Y" (NOT "W")
     * - "15000" → "ZVQQQ"
     */
    const encodeCipher = (text) => {
        if (!text) return '';
        let encoded = '';
        for (const char of text.toString()) {
            if (numberToLetter[char]) {
                encoded += numberToLetter[char];
            } else if (letterToNumber[char]) {
                // Already a letter, keep as-is
                encoded += char.toUpperCase();
            }
            // Skip invalid characters
        }
        return encoded;
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Handle Add Mobile
    const handleAddMobile = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await mobilesAPI.add({
                ...formData,
                purchaseAmount: encodeCipher(formData.purchaseAmount)
            });

            setSuccess('Mobile added successfully!');
            setShowAddModal(false);
            setFormData({ serialNo: '', purchaseDate: '', modelName: '', imei1: '', imei2: '', purchaseAmount: '', ramRom: '', seller: '' });
            fetchMobiles();

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add mobile');
        }
    };

    // Handle Sell Mobile
    const handleSellMobile = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await mobilesAPI.sell(selectedMobile._id, {
                ...sellData,
                salesAmount: parseFloat(sellData.salesAmount)
            });

            setSuccess('Mobile sold successfully!');
            setShowSellModal(false);
            setSellData({ salesDate: '', salesAmount: '' });
            setSelectedMobile(null);
            fetchMobiles();

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to sell mobile');
        }
    };

    // Handle Edit Mobile
    const handleEditMobile = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await mobilesAPI.update(selectedMobile._id, {
                ...editFormData,
                purchaseAmount: encodeCipher(editFormData.purchaseAmount),
                salesAmount: editFormData.salesAmount ? parseFloat(editFormData.salesAmount) : null
            });

            setSuccess('Mobile updated successfully!');
            setShowEditModal(false);
            setEditFormData({ serialNo: '', purchaseDate: '', modelName: '', imei1: '', imei2: '', purchaseAmount: '', ramRom: '', seller: '', salesDate: '', salesAmount: '', status: '' });
            setSelectedMobile(null);
            fetchMobiles();

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update mobile');
        }
    };

    // Handle Delete Mobile
    const handleDeleteMobile = async () => {
        try {
            await mobilesAPI.delete(selectedMobile._id);

            setSuccess('Mobile deleted successfully!');
            setShowDeleteModal(false);
            setSelectedMobile(null);
            fetchMobiles();

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete mobile');
        }
    };

    // Open edit modal
    const openEditModal = (mobile) => {
        setSelectedMobile(mobile);
        setEditFormData({
            serialNo: mobile.serialNo || '',
            purchaseDate: mobile.purchaseDate ? new Date(mobile.purchaseDate).toISOString().split('T')[0] : '',
            modelName: mobile.modelName || '',
            imei1: mobile.imei1 || '',
            imei2: mobile.imei2 || '',
            purchaseAmount: decodeCipher(mobile.purchaseAmount).toString() || '',
            ramRom: mobile.ramRom || '',
            seller: mobile.seller || '',
            salesDate: mobile.salesDate ? new Date(mobile.salesDate).toISOString().split('T')[0] : '',
            salesAmount: mobile.salesAmount || '',
            status: mobile.status || 'IN_STOCK'
        });
        setShowEditModal(true);
    };

    // Open sell modal
    const openSellModal = (mobile) => {
        setSelectedMobile(mobile);
        setSellData({ salesDate: new Date().toISOString().split('T')[0], salesAmount: '' });
        setShowSellModal(true);
    };

    // Open delete modal
    const openDeleteModal = (mobile) => {
        setSelectedMobile(mobile);
        setShowDeleteModal(true);
    };

    return (
        <div className="inventory">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Inventory Management</h1>
                    <p className="page-subtitle">Manage your second-hand mobile phones</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    <FiPlus /> Add Mobile
                </button>
            </div>

            {/* Alerts */}
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-container">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search S.No, Model, IMEI..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            className="search-clear-btn"
                            onClick={() => setSearchTerm('')}
                            type="button"
                        >
                            <FiX />
                        </button>
                    )}
                </div>

                <div className="filter-group">
                    <FiFilter className="filter-icon" />
                    <select
                        className="form-input form-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="IN_STOCK">In Stock</option>
                        <option value="SOLD">Sold</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                {loading ? (
                    <div className="inventory-content">
                        <div className="mobile-card-list">
                            {[1, 2, 3].map(i => <InventoryCardSkeleton key={i} />)}
                        </div>
                        <div className="table-container desktop-only">
                            <table className="table">
                                <thead>
                                    <tr>
                                        {Array(12).fill(0).map((_, i) => <th key={i}><Skeleton width="80px" /></th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <tr key={i}>
                                            {Array(12).fill(0).map((_, j) => <td key={j}><Skeleton width="100%" /></td>)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : mobiles.length === 0 ? (
                    <div className="empty-state">
                        <FiPhone size={48} />
                        <h3>No mobiles found</h3>
                        <p>Start by adding a new mobile to your inventory</p>
                        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                            <FiPlus /> Add Mobile
                        </button>
                    </div>
                ) : (
                    <div className="inventory-content">
                        {/* Mobile Card View (Visible only on mobile) */}
                        <div className="mobile-card-list">
                            {mobiles.map((mobile) => (
                                <div key={mobile._id} className="mobile-inventory-card">
                                    <div className="card-badge-row">
                                        <span className="mobile-serial">S.No: {mobile.serialNo}</span>
                                        <span className={`badge ${mobile.status === 'IN_STOCK' ? 'badge-info' : 'badge-success'}`}>
                                            {mobile.status === 'IN_STOCK' ? 'In Stock' : 'Sold'}
                                        </span>
                                    </div>
                                    <div className="mobile-card-main">
                                        <h3 className="mobile-model">{mobile.modelName}</h3>
                                        <div className="mobile-spec-row">
                                            <span>{mobile.ramRom || 'N/A'}</span>
                                            <span className="dot">•</span>
                                            <span>{formatDate(mobile.purchaseDate)}</span>
                                        </div>
                                    </div>
                                    <div className="mobile-imei-box">
                                        <code>{mobile.imei1}</code>
                                        {mobile.imei2 && <code>{mobile.imei2}</code>}
                                    </div>
                                    <div className="mobile-price-row">
                                        <div className="price-item">
                                            <span className="price-label">Cost:</span>
                                            <span className="price-value">{mobile.purchaseAmount}</span>
                                        </div>
                                        {mobile.status === 'SOLD' && (
                                            <div className="price-item">
                                                <span className="price-label">Sold:</span>
                                                <span className="price-value success">{formatCurrency(mobile.salesAmount)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mobile-card-actions">
                                        <button className="mobile-btn edit" onClick={() => openEditModal(mobile)}>
                                            <FiEdit2 /> Edit
                                        </button>
                                        {mobile.status === 'IN_STOCK' && (
                                            <button className="mobile-btn sell" onClick={() => openSellModal(mobile)}>
                                                <span style={{ fontWeight: 'bold' }}>₹</span> Sell
                                            </button>
                                        )}
                                        <button className="mobile-btn delete" onClick={() => openDeleteModal(mobile)}>
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table (Visible only on desktop) */}
                        <div className="table-container desktop-only">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>S.No</th>
                                        <th>Model Name</th>
                                        <th>RAM / ROM</th>
                                        <th>IMEI 1</th>
                                        <th>IMEI 2</th>
                                        <th>Purchase Date</th>
                                        <th>Purchase Amount</th>
                                        <th>Seller</th>
                                        <th>Sales Date</th>
                                        <th>Sales Amount</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mobiles.map((mobile) => (
                                        <tr key={mobile._id}>
                                            <td>{mobile.serialNo}</td>
                                            <td className="model-name">{mobile.modelName}</td>
                                            <td>{mobile.ramRom || '-'}</td>
                                            <td className="imei">{mobile.imei1}</td>
                                            <td className="imei">{mobile.imei2 || '-'}</td>
                                            <td>{formatDate(mobile.purchaseDate)}</td>
                                            <td>{mobile.purchaseAmount || '-'}</td>
                                            <td>{mobile.seller || '-'}</td>
                                            <td>{formatDate(mobile.salesDate)}</td>
                                            <td>{mobile.salesAmount ? formatCurrency(mobile.salesAmount) : '-'}</td>
                                            <td>
                                                <span className={`badge ${mobile.status === 'IN_STOCK' ? 'badge-info' : 'badge-success'}`}>
                                                    {mobile.status === 'IN_STOCK' ? 'In Stock' : 'Sold'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => openEditModal(mobile)}
                                                        title="Edit Mobile"
                                                    >
                                                        <FiEdit2 />
                                                    </button>
                                                    {mobile.status === 'IN_STOCK' && (
                                                        <button
                                                            className="btn btn-sm btn-success"
                                                            onClick={() => openSellModal(mobile)}
                                                            title="Sell Mobile"
                                                        >
                                                            <span style={{ fontWeight: 'bold' }}>₹</span>
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => openDeleteModal(mobile)}
                                                        title="Delete Mobile"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Mobile Modal */}
            {
                showAddModal && (
                    <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">Add New Mobile</h3>
                                <button className="modal-close" onClick={() => setShowAddModal(false)}>
                                    <FiX />
                                </button>
                            </div>
                            <form onSubmit={handleAddMobile}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label className="form-label">S.No (Optional)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder="Leave blank to auto-generate"
                                            value={formData.serialNo}
                                            onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })}
                                        />
                                        <small className="form-hint">Manual S.No entry. If blank, next sequence is used.</small>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Purchase Date *</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={formData.purchaseDate}
                                            onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Model Name *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="e.g., iPhone 12 Pro"
                                            value={formData.modelName}
                                            onChange={(e) => setFormData({ ...formData, modelName: e.target.value.toUpperCase() })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">IMEI 1 *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="15-digit IMEI 1"
                                            value={formData.imei1}
                                            onChange={(e) => setFormData({ ...formData, imei1: e.target.value })}
                                            pattern="\d{15}"
                                            maxLength="15"
                                            required
                                        />
                                        <small className="form-hint">Enter exactly 15 digits</small>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">IMEI 2 (Optional)</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="15-digit IMEI 2"
                                            value={formData.imei2}
                                            onChange={(e) => setFormData({ ...formData, imei2: e.target.value })}
                                            pattern="\d{15}"
                                            maxLength="15"
                                        />
                                        <small className="form-hint">Enter exactly 15 digits (dual SIM phones)</small>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Purchase Amount (₹) *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="e.g., 25000"
                                            value={formData.purchaseAmount}
                                            onChange={(e) => setFormData({ ...formData, purchaseAmount: e.target.value.replace(/\D/g, '') })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">RAM / ROM</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="e.g., 4/64"
                                            value={formData.ramRom}
                                            onChange={(e) => setFormData({ ...formData, ramRom: e.target.value.replace(/[^0-9/]/g, '') })}
                                        />
                                        <small className="form-hint">e.g., 4/64 for 4GB RAM / 64GB ROM</small>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Seller</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Seller name"
                                            value={formData.seller}
                                            onChange={(e) => setFormData({ ...formData, seller: e.target.value })}
                                        />
                                    </div>
                                    <div className="modal-bottom-spacer"></div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        <FiPlus /> Add Mobile
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Edit Mobile Modal */}
            {
                showEditModal && selectedMobile && (
                    <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                        <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">Edit Mobile</h3>
                                <button className="modal-close" onClick={() => setShowEditModal(false)}>
                                    <FiX />
                                </button>
                            </div>
                            <form onSubmit={handleEditMobile}>
                                <div className="modal-body">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">S.No *</label>
                                            <input
                                                type="number"
                                                className="form-input"
                                                placeholder="Serial Number"
                                                value={editFormData.serialNo}
                                                onChange={(e) => setEditFormData({ ...editFormData, serialNo: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Purchase Date *</label>
                                            <input
                                                type="date"
                                                className="form-input"
                                                value={editFormData.purchaseDate}
                                                onChange={(e) => setEditFormData({ ...editFormData, purchaseDate: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Model Name *</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="e.g., iPhone 12 Pro"
                                                value={editFormData.modelName}
                                                onChange={(e) => setEditFormData({ ...editFormData, modelName: e.target.value.toUpperCase() })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">IMEI 1 *</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="15-digit IMEI 1"
                                                value={editFormData.imei1}
                                                onChange={(e) => setEditFormData({ ...editFormData, imei1: e.target.value })}
                                                pattern="\d{15}"
                                                maxLength="15"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">IMEI 2</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="15-digit IMEI 2"
                                                value={editFormData.imei2}
                                                onChange={(e) => setEditFormData({ ...editFormData, imei2: e.target.value })}
                                                pattern="\d{15}"
                                                maxLength="15"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Purchase Amount *</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="e.g., 25000"
                                                value={editFormData.purchaseAmount}
                                                onChange={(e) => setEditFormData({ ...editFormData, purchaseAmount: e.target.value.replace(/\D/g, '') })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">RAM / ROM</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="e.g., 4/64"
                                                value={editFormData.ramRom}
                                                onChange={(e) => setEditFormData({ ...editFormData, ramRom: e.target.value.replace(/[^0-9/]/g, '') })}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Seller</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Seller name"
                                                value={editFormData.seller}
                                                onChange={(e) => setEditFormData({ ...editFormData, seller: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Status</label>
                                            <select
                                                className="form-input form-select"
                                                value={editFormData.status}
                                                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                            >
                                                <option value="IN_STOCK">In Stock</option>
                                                <option value="SOLD">Sold</option>
                                            </select>
                                        </div>
                                    </div>
                                    {editFormData.status === 'SOLD' && (
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label className="form-label">Sales Date</label>
                                                <input
                                                    type="date"
                                                    className="form-input"
                                                    value={editFormData.salesDate}
                                                    onChange={(e) => setEditFormData({ ...editFormData, salesDate: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Sales Amount (₹)</label>
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    placeholder="e.g., 30000"
                                                    value={editFormData.salesAmount}
                                                    onChange={(e) => setEditFormData({ ...editFormData, salesAmount: e.target.value })}
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <div className="modal-bottom-spacer"></div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        <FiEdit2 /> Update Mobile
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Sell Mobile Modal */}
            {
                showSellModal && selectedMobile && (
                    <div className="modal-overlay" onClick={() => setShowSellModal(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">Sell Mobile</h3>
                                <button className="modal-close" onClick={() => setShowSellModal(false)}>
                                    <FiX />
                                </button>
                            </div>
                            <form onSubmit={handleSellMobile}>
                                <div className="modal-body">
                                    <div className="sell-mobile-info">
                                        <p><strong>Model:</strong> {selectedMobile.modelName}</p>
                                        <p><strong>IMEI 1:</strong> {selectedMobile.imei1}</p>
                                        {selectedMobile.imei2 && <p><strong>IMEI 2:</strong> {selectedMobile.imei2}</p>}
                                        <p><strong>Purchase Price:</strong> {selectedMobile.purchaseAmount}</p>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Sales Date *</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={sellData.salesDate}
                                            onChange={(e) => setSellData({ ...sellData, salesDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Sales Amount (₹) *</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder="e.g., 30000"
                                            value={sellData.salesAmount}
                                            onChange={(e) => setSellData({ ...sellData, salesAmount: e.target.value })}
                                            min="0"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowSellModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-success">
                                        <span style={{ fontWeight: 'bold' }}>₹</span> Confirm Sale
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Delete Confirmation Modal */}
            {
                showDeleteModal && selectedMobile && (
                    <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">Delete Mobile</h3>
                                <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                                    <FiX />
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="delete-warning">
                                    <FiTrash2 size={48} />
                                    <p>Are you sure you want to delete this mobile?</p>
                                    <div className="delete-mobile-info">
                                        <p><strong>Model:</strong> {selectedMobile.modelName}</p>
                                        <p><strong>IMEI 1:</strong> {selectedMobile.imei1}</p>
                                        {selectedMobile.imei2 && <p><strong>IMEI 2:</strong> {selectedMobile.imei2}</p>}
                                    </div>
                                    <small>This action cannot be undone.</small>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-danger btn-delete-primary" onClick={handleDeleteMobile}>
                                    <FiTrash2 /> Delete
                                </button>
                                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Floating Action Button (Mobile Only) */}
            <button
                className="fab-add-mobile"
                onClick={() => setShowAddModal(true)}
                aria-label="Add New Mobile"
            >
                <FiPlus />
            </button>
        </div >
    );
};

export default Inventory;
