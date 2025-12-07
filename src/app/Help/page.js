// app/help/page.js
import { Phone, Mail, BookOpen, Clock } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background-light font-mitr pb-24 px-6 pt-8">
      <h1 className="text-2xl font-bold text-primary-dark mb-6">ช่วยเหลือและสนับสนุน ❓</h1>

      {/* Contact Card */}
      <div className="bg-white rounded-3xl p-6 shadow-lg mb-6 text-center">
        <h2 className="text-lg font-bold text-primary-medium mb-3">ติดต่อทีมสนับสนุน</h2>
        <div className="space-y-3 text-gray-700">
          <div className="flex items-center justify-center gap-3">
            <Phone size={18} className="text-primary-dark" />
            <span>โทร: 099-XXX-XXXX</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Mail size={18} className="text-primary-dark" />
            <span>Email: support@farmbrain.com</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
            <Clock size={16} />
            <span>เวลาทำการ: จันทร์ - ศุกร์ (09:00 - 17:00 น.)</span>
          </div>
        </div>
      </div>

      {/* How-to-Use Section */}
      <div className="mb-6">
        <h2 className="text-sm text-gray-500 mb-2 ml-2 flex items-center gap-2"><BookOpen size={16}/> วิธีใช้งานเบื้องต้น</h2>
        <div className="bg-white rounded-3xl p-5 shadow-lg space-y-3 text-gray-700">
          <p className="font-semibold text-primary-dark">1. การตั้งค่าระบบ</p>
          <p className="text-sm text-gray-600 pl-4">
             ไปที่หน้า **ตั้งค่า** เพื่อเปิด/ปิดระบบที่คุณไม่ได้ติดตั้ง (เช่น ปิดระบบปุ๋ย) และกำหนดขนาดพื้นที่ปลูกเพื่อคำนวณทรัพยากร
          </p>
          <p className="font-semibold text-primary-dark">2. การสลับโหมดควบคุม</p>
          <p className="text-sm text-gray-600 pl-4">
             ในหน้า **ควบคุม** คุณสามารถสลับเป็น **Manual** เพื่อควบคุมการรดน้ำ/ไฟ ด้วยตนเอง หรือปล่อยเป็น **Auto** ให้ระบบทำงานตามค่าที่ตั้งไว้
          </p>
        </div>
      </div>

    </div>
  );
}