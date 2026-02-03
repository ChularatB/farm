"use client";
import { useState, useEffect } from 'react';
import Link from "next/link";
import { X } from "lucide-react";
import { GoBellFill } from "react-icons/go";
import { MdInfo } from "react-icons/md";

export default function Header() {
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // ดึงข้อมูลแจ้งเตือน
  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
        // ถ้าเรายังไม่ได้เปิดดู ให้ใช้นับจำนวนจาก DB
        // (แต่ถ้าเราเปิดดูแล้ว unreadCount จะเป็น 0 จากการกดคลิก)
        if (!showNotif) { 
            setUnreadCount(data.notifications.filter(n => !n.is_read).length);
        }
      }
    } catch (error) {
      console.error("Fetch notif error", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // ✅ ฟังก์ชันใหม่: กดแล้วเปิด และลบจุดแดงทันที
  const handleBellClick = () => {
    if (!showNotif) {
        // ถ้ากำลังจะเปิด -> ให้จุดแดงหายไป (เคลียร์เป็น 0)
        setUnreadCount(0);
        
        // *Optional: ตรงนี้ในอนาคตแกอาจจะยิง API ไปบอก Server ว่า "อ่านแล้วนะ" ได้
        // await fetch('/api/notifications/mark-read', { method: 'POST' });
    }
    setShowNotif(!showNotif); // สลับเปิด/ปิด
  };

  return (
    <div className="m-7 flex items-center justify-between relative z-50">
      {/* Logo Section */}
      <Link href="/">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Cropsy Logo" width={30} />
          <h1 className="text-xl font-bold text-primary-dark">FarmBrain</h1>
        </div>
      </Link>

      {/* Right Section */}
      <div className="flex items-center gap-4">

        {/* 🔔 Notification Icon Wrapper */}
        <div className="relative">
          <button
            onClick={handleBellClick} // ✅ ใช้ฟังก์ชันใหม่ตรงนี้
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <GoBellFill size={30} className="text-primary-medium hover:opacity-80 transition-opacity" alt="Notification" />

            {/* 🔴 จุดแดงแจ้งเตือน (ปรับตำแหน่งให้สวยขึ้น) */}
            {unreadCount > 0 && (
              <span className="absolute top-1 right-2 block h-3 w-3 rounded-full ring-2 ring-white bg-red-500 transform translate-x-1/4 -translate-y-1/4">
              </span>
            )}
          </button>

          {/* 📜 Notification Dropdown */}
          {showNotif && (
            <div className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="p-3 bg-primary-medium/10 border-b border-gray-100 flex justify-between items-center">
                <span className="text-xs font-bold text-primary-dark">การแจ้งเตือนล่าสุด</span>
                <button onClick={() => setShowNotif(false)}><X size={14} className="text-gray-400" /></button>
              </div>

              <div className="max-h-64 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif, index) => (
                    <div key={index} className="p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <p className="text-xs text-gray-700 font-medium mb-1">{notif.message}</p>
                      <p className="text-[10px] text-gray-400 text-right">
                        {new Date(notif.created_at.value).toLocaleString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-gray-400">ไม่มีการแจ้งเตือนใหม่</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Help Icon */}
        <Link href="/Help">
          <MdInfo size={30} className="text-primary-medium hover:opacity-80 transition-opacity" alt="Help" />
        </Link>
      </div>
    </div>
  );
}