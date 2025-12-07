// components/BottomNav.js
"use client";
import { Home, Settings, User, Sliders } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'หน้าหลัก', icon: Home, path: '/' },
    { name: 'ควบคุม', icon: Sliders, path: '/Control' }, // แยกหน้าควบคุมถ้าต้องการ หรือรวมในหน้าหลักก็ได้
    { name: 'ตั้งค่า', icon: Settings, path: '/Setting' },
    { name: 'โปรไฟล์', icon: User, path: '/Profile' },
  ];

  return (
    <div className="fixed bottom-4 left-4 right-4 h-16 bg-gradient-to-r from-primary-dark to-primary-medium rounded-full shadow-2xl flex justify-around items-center z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path;
        return (
          <Link key={item.path} href={item.path} className="relative flex flex-col items-center justify-center w-full h-full">
            {isActive && (
              <span className="absolute -bottom-1 w-1 h-1 bg-white rounded-full mb-2"></span>
            )}
            <Icon 
              size={24} 
              className={`transition-all duration-300 ${isActive ? 'text-white scale-110' : 'text-primary-dark/60 mix-blend-screen'}`} 
            />
          </Link>
        );
      })}
    </div>
  );
}