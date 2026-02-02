import React from 'react';
import './Skeleton.css';

const Skeleton = ({ width, height, borderRadius, className = '' }) => {
    return (
        <div
            className={`skeleton ${className}`}
            style={{
                width: width || '100%',
                height: height || '20px',
                borderRadius: borderRadius || '8px'
            }}
        />
    );
};

export const CardSkeleton = () => (
    <div className="card skeleton-card">
        <Skeleton height="40px" width="40px" borderRadius="10px" className="mb-16" />
        <Skeleton height="24px" width="60%" className="mb-8" />
        <Skeleton height="16px" width="40%" />
    </div>
);

export const InventoryCardSkeleton = () => (
    <div className="mobile-inventory-card skeleton-card">
        <div className="card-badge-row">
            <Skeleton width="60px" height="14px" />
            <Skeleton width="80px" height="24px" borderRadius="20px" />
        </div>
        <Skeleton height="24px" width="80%" className="mt-8" />
        <Skeleton height="16px" width="40%" />
        <Skeleton height="40px" width="100%" borderRadius="8px" className="mt-12" />
        <div className="mobile-price-row mt-12">
            <Skeleton width="60px" height="30px" />
            <Skeleton width="60px" height="30px" />
        </div>
        <div className="mobile-card-actions mt-12">
            <Skeleton height="40px" />
            <Skeleton height="40px" />
            <Skeleton height="40px" width="40px" />
        </div>
    </div>
);

export default Skeleton;
