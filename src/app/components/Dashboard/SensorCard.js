// src/app/components/Dashboard/SensorCard.js
import React from 'react';

// ตัวอย่าง Icon (ในโปรเจกต์จริงควรใช้ Icon Library เช่น react-icons)
const Icon = ({ children }) => <div className="text-xl font-bold">{children}</div>;

export default function SensorCard({ title, value, unit, icon, color = 'primary-dark' }) {
    return (
        <div className={`p-4 rounded-xl shadow-lg bg-secondary-light/70 border border-primary-medium/30 transition-shadow hover:shadow-xl`}>
            <div className={`flex items-center justify-between mb-2 text-${color}`}>
                <h3 className="text-sm font-semibold uppercase text-gray-700">{title}</h3>
                {icon && <Icon>{icon}</Icon>}
            </div>
            <div className="flex items-baseline">
                <p className={`text-4xl font-bold text-${color}`}>
                    {value.toFixed(1)}
                </p>
                <span className="ml-2 text-lg font-medium text-gray-500">{unit}</span>
            </div>
        </div>
    );
}