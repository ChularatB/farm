// src/app/api/control/route.js
import { NextResponse } from 'next/server';

// 🛑 เปลี่ยนเป็น 127.0.0.1 จะชัวร์กว่า localhost ในหลายๆ เครื่องจ่ะ
const BACKEND_URL = 'https://farmbrain-bridge-81675649311.asia-southeast1.run.app';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("📡 [Next.js API] กำลังส่งคำสั่งไป Backend:", body);

    const res = await fetch(`${BACKEND_URL}/update-config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store' // ไม่ให้จำค่าเก่า
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("❌ Backend ตอบกลับ Error:", res.status, errText);
      // ส่ง status กลับไปให้หน้าเว็บรู้ว่าพังที่ Backend
      return NextResponse.json({ error: `Backend พัง: ${res.status} ${errText}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, message: 'สั่งงานเรียบร้อย', data });

  } catch (error) {
    console.error('🔥 API Control Error (เชื่อมต่อไม่ติด):', error.message);
    // ถ้าพังตรงนี้แปลว่าหาเซิร์ฟเวอร์ Backend ไม่เจอ
    return NextResponse.json({ 
      error: 'เชื่อมต่อ Express Backend ไม่ได้ (เซิร์ฟเวอร์ปิดอยู่ หรือตั้ง URL ผิด)',
      details: error.message 
    }, { status: 500 });
  }
}