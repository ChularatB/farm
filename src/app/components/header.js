"use client";
import { useState, useEffect, useRef } from 'react'; 
import Link from "next/link";
import { X, AlertTriangle } from "lucide-react";
import { GoBellFill } from "react-icons/go";
import { MdInfo } from "react-icons/md";

export default function Header() {
  const [showNotif, setShowNotif] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [notifications, setNotifications] = useState([]); 
  const [sensorAlerts, setSensorAlerts] = useState([]);

  const lastReadTimeRef = useRef(null);

  const checkSensorAlerts = async () => {
    try {
      const res = await fetch('/api/sensors?range=1H');
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        const currentData = json.data[0]; 
        let newAlerts = [];

        if (currentData.temperature > 35) {
            newAlerts.push({ type: 'temp', msg: `ระวัง! อุณหภูมิร้อนจัด: ${parseFloat(currentData.temperature).toFixed(1)}°C`, time: currentData.timestamp });
        }
        if (currentData.soil_moisture > 2800) {
            newAlerts.push({ type: 'soil', msg: `รดน้ำด่วน! ดินแห้งมาก (ค่า: ${parseInt(currentData.soil_moisture)})`, time: currentData.timestamp });
        }

        setSensorAlerts(newAlerts);
        
        if (newAlerts.length > 0) {
            const latestAlertTime = new Date(currentData.timestamp).getTime();
            
            if (!lastReadTimeRef.current || latestAlertTime > lastReadTimeRef.current) {
                if (!showNotif) {
                    setUnreadCount(newAlerts.length);
                }
            }
        } else {
            setUnreadCount(0);
        }
      }
    } catch (error) {
       console.error("Error checking sensor alerts", error);
    }
  };

  useEffect(() => {
    checkSensorAlerts(); 

    const interval = setInterval(() => {
        checkSensorAlerts();
    }, 10000); 
    
    return () => clearInterval(interval);
  }, [showNotif]); 

  const handleBellClick = () => {
    if (!showNotif) {
        setUnreadCount(0); 
        
        if (sensorAlerts.length > 0) {
            lastReadTimeRef.current = new Date(sensorAlerts[0].time).getTime();
        } else {
            lastReadTimeRef.current = Date.now();
        }
    }
    setShowNotif(!showNotif);
  };

  const allAlerts = [...sensorAlerts, ...notifications];

  return (
    <div className="m-7 flex items-center justify-between relative z-50">
      <Link href="/">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Cropsy Logo" width={30} />
          <h1 className="text-xl font-bold text-primary-dark">FarmBrain</h1>
        </div>
      </Link>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button onClick={handleBellClick} className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
            <GoBellFill size={30} className="text-primary-medium hover:opacity-80 transition-opacity" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-2 block h-3 w-3 rounded-full ring-2 ring-white bg-red-500 transform translate-x-1/4 -translate-y-1/4"></span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="p-3 bg-primary-medium/10 border-b border-gray-100 flex justify-between items-center">
                <span className="text-xs font-bold text-primary-dark">การแจ้งเตือนล่าสุด</span>
                <button onClick={() => setShowNotif(false)}><X size={14} className="text-gray-400" /></button>
              </div>

              <div className="max-h-72 overflow-y-auto">
                {allAlerts.length > 0 ? (
                  allAlerts.map((notif, index) => (
                    <div key={index} className={`p-4 border-b border-gray-50 flex items-start gap-3 transition-colors ${notif.type ? 'bg-orange-50/50 hover:bg-orange-50' : 'hover:bg-gray-50'}`}>
                      
                      <div className={`p-2 rounded-full mt-1 ${notif.type === 'temp' ? 'bg-red-100 text-red-500' : notif.type === 'soil' ? 'bg-orange-100 text-orange-500' : 'bg-gray-100 text-gray-400'}`}>
                        {notif.type ? <AlertTriangle size={16} /> : <GoBellFill size={16} />}
                      </div>

                      <div className="flex-1">
                        <p className={`text-xs font-bold mb-1 ${notif.type === 'temp' ? 'text-red-700' : notif.type === 'soil' ? 'text-orange-700' : 'text-gray-700'}`}>
                            {notif.msg || notif.message}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(notif.time || (notif.created_at && notif.created_at.value) || new Date()).toLocaleString('th-TH', { 
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                          })}
                        </p>
                      </div>

                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center flex flex-col items-center">
                     <GoBellFill size={32} className="text-gray-200 mb-2" />
                     <p className="text-xs text-gray-400 font-bold">ไม่มีการแจ้งเตือนใหม่</p>
                     <p className="text-[10px] text-gray-300">ระบบทำงานปกติ</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <Link href="/Help">
          <MdInfo size={30} className="text-primary-medium hover:opacity-80 transition-opacity" />
        </Link>
      </div>
    </div>
  );
}