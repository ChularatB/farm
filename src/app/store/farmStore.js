import { create } from 'zustand';

// // โครงสร้างข้อมูล Sensor ที่เราคาดหวัง
// const initialSensorData = {
//     air_temp: 0, // อุณหภูมิอากาศ (°C)
//     air_humidity: 0, // ความชื้นอากาศ (%)
//     soil_moisture: 0, // ความชื้นในดิน (%)
//     light_lux: 0, // ค่าความสว่าง (Lux)
//     ph_level: 0, // ค่า pH
//     ec_value: 0, // ค่า EC
//     timestamp: null, // เวลาที่ข้อมูลถูกบันทึก
// };

// // โครงสร้างข้อมูลสถานะอุปกรณ์
// const initialDeviceStatus = {
//     pump_water: false, // ปั๊มน้ำ (ON/OFF)
//     pump_nut_a: false, // ปั๊มปุ๋ย A
//     pump_nut_b: false, // ปั๊มปุ๋ย B
//     fan_ventilation: false, // พัดลม/ระบายอากาศ
// };

// // สร้าง Zustand Store
// export const useFarmStore = create((set) => ({
//     // สถานะข้อมูลหลัก
//     sensorData: initialSensorData,
//     deviceStatus: initialDeviceStatus,
    
//     // สถานะ UI/Loading
//     isLoading: true, // สำหรับบอกว่ากำลังโหลดข้อมูลครั้งแรก
//     lastUpdated: null, // เวลาที่สถานะถูกอัปเดตใน Frontend

//     // Action (ฟังก์ชันสำหรับอัปเดตสถานะ)
//     setSensorData: (data) => set((state) => ({ 
//         sensorData: { ...state.sensorData, ...data },
//         isLoading: false,
//         lastUpdated: new Date().toLocaleTimeString(),
//     })),

//     setDeviceStatus: (status) => set((state) => ({ 
//         deviceStatus: { ...state.deviceStatus, ...status } 
//     })),
    
//     setLoading: (loading) => set({ isLoading: loading }),
// }));

// src/app/store/farmStore.js (ปรับปรุงค่า initial)

// โครงสร้างข้อมูล Sensor ที่เราคาดหวัง
const initialSensorData = {
    air_temp: 28.5, // อุณหภูมิอากาศ (°C)
    air_humidity: 75.3, // ความชื้นอากาศ (%)
    soil_moisture: 62.1, // ความชื้นในดิน (%)
    light_lux: 4500, // ค่าความสว่าง (Lux)
    ph_level: 6.2, // ค่า pH
    ec_value: 1.9, // ค่า EC
    timestamp: new Date().toISOString(), // เวลาที่ข้อมูลถูกบันทึก
};

// โครงสร้างข้อมูลสถานะอุปกรณ์
const initialDeviceStatus = {
    pump_water: true, // ปั๊มน้ำ (ON)
    pump_nut_a: false, // ปั๊มปุ๋ย A (OFF)
    pump_nut_b: false, // ปั๊มปุ๋ย B (OFF)
    fan_ventilation: true, // พัดลม/ระบายอากาศ (ON)
};

// สร้าง Zustand Store
export const useFarmStore = create((set) => ({
    // สถานะข้อมูลหลัก
    sensorData: initialSensorData, // ใช้ค่า Mockup
    deviceStatus: initialDeviceStatus, // ใช้ค่า Mockup
    
    // สถานะ UI/Loading
    isLoading: false, // ตั้งเป็น false เพื่อให้แสดงผลทันที
    lastUpdated: new Date().toLocaleTimeString('th-TH'), 

    // ... ส่วน Action (setSensorData, setDeviceStatus, setLoading) เหมือนเดิม
    // ...
}));