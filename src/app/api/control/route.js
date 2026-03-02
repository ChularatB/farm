// src/app/api/control/route.js
import { NextResponse } from 'next/server';

// 🛑 ถ้าเอา Backend ขึ้นเซิร์ฟเวอร์จริง (เช่น Render, Cloud Run) ให้เปลี่ยน URL ตรงนี้นะ
// ตอนนี้ชั้นใส่ localhost:8080 เผื่อแกรันเทสต์ในเครื่องตัวเองจ่ะ
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

export async function POST(request) {
  try {
    const body = await request.json();
    // รับค่ามาจากหน้าเว็บ
    const { device_id, operation_mode, pump_command } = body; 

    // ยิงคำสั่งไปหา Express Backend ของแกที่ Path /update-config
    const res = await fetch(`${BACKEND_URL}/update-config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        device_id: device_id || 'farm_001', 
        operation_mode: operation_mode !== undefined ? operation_mode : 1,
        pump_command: pump_command
      })
    });

    if (!res.ok) throw new Error('เชื่อมต่อ Backend ไม่สำเร็จ');

    const data = await res.json();
    return NextResponse.json({ success: true, message: 'สั่งงานเรียบร้อย', data });

  } catch (error) {
    console.error('API Control Error:', error);
    return NextResponse.json({ error: 'Failed to send command' }, { status: 500 });
  }
}