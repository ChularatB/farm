// src/app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import bigquery from '@/lib/bigquery';
import { hash } from 'bcrypt';

export async function POST(request) {
  try {
    const { name, phone, password } = await request.json();

    // 1. ตรวจสอบค่าที่ส่งมา
    if (!phone || !password || !name) {
      return NextResponse.json({ error: 'กรอกข้อมูลไม่ครบจ่ะแก' }, { status: 400 });
    }

    // 2. ✨ ส่วนสำคัญ: สร้าง device_id อัตโนมัติ ✨
    // สุ่มเลข 4 หลักมาต่อท้ายคำว่า farm_
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newDeviceId = `farm_${randomNum}`;

    // 3. เข้ารหัสรหัสผ่าน
    const hashedPassword = await hash(password, 10);

    // 4. บันทึกลง BigQuery
    const insertQuery = `
      INSERT INTO \`smart-farm-c9d48.smartfarm.users\` (name, email, phone, password, device_id, created_at)
      VALUES (@name, @phone, @phone, @password, @deviceId, CURRENT_TIMESTAMP())
    `;

    await bigquery.query({
      query: insertQuery,
      params: { 
        name, 
        phone, 
        password: hashedPassword,
        deviceId: newDeviceId // ยัดรหัสฟาร์มที่เราสุ่มได้ลงไป
      },
    });

    return NextResponse.json({ success: true, deviceId: newDeviceId });

  } catch (error) {
    console.error('Register Error:', error);
    return NextResponse.json({ error: 'สมัครไม่สำเร็จว่ะแก' }, { status: 500 });
  }
}