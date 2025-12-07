// src/app/components/Control/ThresholdSetting.js
'use client';

import React, { useState } from 'react';

// โครงสร้างค่าเริ่มต้นของ Thresholds (ในจริงควรดึงมาจาก Firestore)
const initialThresholds = {
    soil_moisture_min: 55, // ถ้าน้อยกว่า 55% ให้รดน้ำ
    air_temp_max: 30, // ถ้ามากกว่า 30C ให้เปิดพัดลม
    ph_level_min: 5.8,
    ec_value_min: 1.8,
};

export default function ThresholdSetting() {
    const [thresholds, setThresholds] = useState(initialThresholds);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setThresholds(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // **(TODO: Actual Implementation)** // 1. ส่งค่า Thresholds ใหม่ไปบันทึกใน Firestore (เช่น /settings/thresholds)
        // 2. Cloud Function จะอ่านค่าเหล่านี้เพื่อใช้ในการตัดสินใจควบคุม
        
        // Fetch('/api/settings/thresholds', { method: 'POST', body: JSON.stringify(thresholds) });

        alert('บันทึก Threshold Logic ใหม่เรียบร้อยแล้ว!\n' + JSON.stringify(thresholds, null, 2));
    };

    // กำหนดรายการ Thresholds ที่ผู้ใช้ตั้งค่าได้
    const settingsFields = [
        { name: 'soil_moisture_min', label: 'ความชื้นดินต่ำสุด (%)', unit: '%', type: 'number', description: 'ถ้าน้อยกว่าค่านี้ -> เปิดปั๊มน้ำ' },
        { name: 'air_temp_max', label: 'อุณหภูมิอากาศสูงสุด (°C)', unit: '°C', type: 'number', description: 'ถ้ามากกว่าค่านี้ -> เปิดพัดลม' },
        { name: 'ph_level_min', label: 'pH ต่ำสุด', unit: '', type: 'number', description: 'ถ้าต่ำกว่าค่านี้ -> แจ้งเตือน' },
        { name: 'ec_value_min', label: 'EC ต่ำสุด', unit: 'dS/m', type: 'number', description: 'ถ้าต่ำกว่าค่านี้ -> แจ้งเตือน' },
    ];

    return (
        <div className="p-6 rounded-xl bg-white shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-primary-dark">
                ตั้งค่าระบบควบคุมอัตโนมัติ (Threshold Logic)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
                กำหนดขีดจำกัดของค่าเซ็นเซอร์เพื่อกระตุ้นการทำงานของอุปกรณ์อัตโนมัติ
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                {settingsFields.map((field) => (
                    <div key={field.name} className="flex flex-col md:flex-row md:items-center">
                        <label htmlFor={field.name} className="md:w-1/3 font-medium text-gray-700">
                            {field.label}
                        </label>
                        <div className="md:w-2/3 flex items-center">
                            <input
                                id={field.name}
                                type={field.type}
                                name={field.name}
                                value={thresholds[field.name]}
                                onChange={handleChange}
                                step="0.1"
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-primary-medium focus:border-primary-medium"
                                required
                            />
                            <span className="ml-2 text-gray-500">{field.unit}</span>
                            <p className="ml-4 text-xs text-gray-400 hidden sm:block">({field.description})</p>
                        </div>
                    </div>
                ))}

                <button
                    type="submit"
                    className="w-full bg-primary-dark hover:bg-primary-medium text-white font-bold py-3 px-4 rounded-lg transition duration-200 shadow-md"
                >
                    บันทึกการตั้งค่า Threshold
                </button>
            </form>
        </div>
    );
}