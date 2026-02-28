// src/app/Help/page.js
"use client";
import { useState } from 'react';
import { Phone, Mail, BookOpen, Clock, Camera, BarChart3, Settings, HelpCircle, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

export default function HelpPage() {
  const [openFAQ, setOpenFAQ] = useState(null);

  const faqs = [
    {
      q: "ทำไมกดถ่ายรูปแล้วภาพไม่ขึ้นทันที?",
      a: "ระบบต้องส่งคำสั่งไปที่บอร์ดเซนเซอร์และรอให้กล้องถ่ายภาพแล้วอัปโหลดกลับมา ซึ่งอาจใช้เวลาประมาณ 10-15 วินาที กรุณารอสักครู่แล้วภาพจะอัปเดตขึ้นมาอัตโนมัติ"
    },
    {
      q: "ต้องการสั่งรดน้ำด้วยตัวเองต้องทำอย่างไร?",
      a: "ไปที่หน้า 'ควบคุม' แล้วกดปุ่มสลับโหมดจาก Auto เป็น Manual หลังจากนั้นปุ่มสั่งรดน้ำ/เปิดไฟ จะสามารถกดใช้งานได้"
    },
    {
      q: "ดูรหัส Device ID ของบอร์ดได้ที่ไหน?",
      a: "สามารถดูรหัส User ID และ Device ID ได้ที่หน้า 'โปรไฟล์' ของคุณ เพื่อนำไปใช้ตรวจสอบการเชื่อมต่อกับอุปกรณ์"
    }
  ];

  return (
    <div className="min-h-screen bg-background-light font-mitr pb-24 px-6 pt-8">
      <h1 className="text-2xl font-bold text-primary-dark mb-6">ช่วยเหลือและสนับสนุน ❓</h1>

      {/* Contact Card */}
      <div className="bg-white rounded-[32px] p-6 shadow-lg mb-6 border border-secondary-light">
        <h2 className="text-lg font-bold text-primary-medium mb-4 flex items-center justify-center gap-2">
          <Phone size={20} /> ติดต่อทีมสนับสนุน
        </h2>
        <div className="space-y-4 text-gray-700 bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-primary-dark"><Phone size={18} /></div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">เบอร์โทรศัพท์</p>
              <p className="font-medium text-primary-dark text-sm">099-XXX-XXXX</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-primary-dark"><Mail size={18} /></div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">อีเมล</p>
              <p className="font-medium text-primary-dark text-sm">support@farmbrain.com</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-primary-dark"><Clock size={18} /></div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">เวลาทำการ</p>
              <p className="font-medium text-primary-dark text-sm">จันทร์ - ศุกร์ (09:00 - 17:00 น.)</p>
            </div>
          </div>
        </div>
      </div>

      {/* How-to-Use Section */}
      <div className="mb-6">
        <h2 className="text-sm text-gray-500 mb-2 ml-2 flex items-center gap-2 font-bold"><BookOpen size={16}/> คู่มือการใช้งานเบื้องต้น</h2>
        <div className="bg-white rounded-[32px] p-5 shadow-lg space-y-5 border border-secondary-light">
          
          <div className="flex gap-4 items-start">
            <div className="mt-1 text-primary-medium bg-primary-medium/10 p-2 rounded-full"><Settings size={18}/></div>
            <div>
              <p className="font-bold text-primary-dark text-sm">1. การตั้งค่าระบบและเวลา</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                ไปที่หน้า <b>ตั้งค่า</b> เพื่อเปิด/ปิดระบบที่คุณต้องการ (รดน้ำ, ไฟ, ปุ๋ย) และสามารถตั้งเวลาเปิดไฟ หรือตั้งรอบวันใส่ปุ๋ยล่วงหน้าได้
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="mt-1 text-blue-500 bg-blue-50 p-2 rounded-full"><Camera size={18}/></div>
            <div>
              <p className="font-bold text-primary-dark text-sm">2. การสั่งงานและถ่ายภาพ</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                ในหน้า <b>ควบคุม</b> คุณสามารถสลับเป็น <b>Manual</b> เพื่อสั่งรดน้ำด้วยตนเอง หรือกดที่ไอคอนกล้อง 📸 ที่มุมขวาบนของรูปเพื่อสั่งให้กล้องที่ฟาร์มถ่ายภาพอัปเดตล่าสุด
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="mt-1 text-green-500 bg-green-50 p-2 rounded-full"><BarChart3 size={18}/></div>
            <div>
              <p className="font-bold text-primary-dark text-sm">3. ดูสถิติย้อนหลัง</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                หน้า <b>ประวัติย้อนหลัง</b> จะแสดงกราฟข้อมูลความชื้นในดิน อากาศ และอุณหภูมิ ที่ดึงมาจากเซนเซอร์แบบเรียลไทม์
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-6">
        <h2 className="text-sm text-gray-500 mb-2 ml-2 flex items-center gap-2 font-bold"><HelpCircle size={16}/> คำถามที่พบบ่อย (FAQ)</h2>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-[24px] shadow-sm border border-secondary-light overflow-hidden">
              <button 
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                className="w-full text-left px-5 py-4 flex justify-between items-center font-bold text-primary-dark text-sm hover:bg-gray-50 transition-colors"
              >
                {faq.q}
                <ChevronDown size={18} className={clsx("transition-transform duration-300 text-gray-400", openFAQ === index && "rotate-180")} />
              </button>
              <div className={clsx("px-5 text-xs text-gray-500 leading-relaxed transition-all duration-300 overflow-hidden bg-gray-50/50", openFAQ === index ? "max-h-40 py-4 border-t border-gray-100 opacity-100" : "max-h-0 py-0 opacity-0")}>
                {faq.a}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}