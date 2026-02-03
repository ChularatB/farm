// src/app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import bigquery from '@/lib/bigquery';
import { hash } from 'bcrypt';

export async function POST(request) {
  try {
    // 1. รับค่าทั้ง name, email, phone, password
    const { name, email, phone, password } = await request.json();

    // 2. ตรวจสอบว่ากรอกครบไหม
    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบทุกช่อง' }, { status: 400 });
    }

    // 3. เช็คว่ามี Email หรือ เบอร์โทร นี้ซ้ำไหม
    const checkQuery = `
        SELECT email, phone 
        FROM \`smart-farm-c9d48.smartfarm.users\` 
        WHERE email = @email OR phone = @phone
    `;
    const [existing] = await bigquery.query({ 
        query: checkQuery, 
        params: { email, phone } 
    });

    if (existing.length > 0) {
      return NextResponse.json({ error: 'อีเมลหรือเบอร์โทรนี้ ถูกใช้งานแล้ว' }, { status: 400 });
    }

    // 4. สุ่มรหัสฟาร์ม (Device ID)
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const newDeviceId = `farm_${randomId}`;

    // 5. เข้ารหัสรหัสผ่าน
    const hashedPassword = await hash(password, 10);

    // 6. บันทึกลง BigQuery (แยกช่อง email และ phone ชัดเจน)
    const insertQuery = `
      INSERT INTO \`smart-farm-c9d48.smartfarm.users\` 
      (name, email, phone, password, device_id, created_at)
      VALUES (@name, @email, @phone, @password, @deviceId, CURRENT_TIMESTAMP())
    `;

    await bigquery.query({
      query: insertQuery,
      params: { 
        name, 
        email, 
        phone, 
        password: hashedPassword, 
        deviceId: newDeviceId 
      },
    });

    return NextResponse.json({ success: true, deviceId: newDeviceId });

  } catch (error) {
    console.error('Register Error:', error);
    return NextResponse.json({ error: 'ระบบขัดข้อง สมัครไม่สำเร็จ' }, { status: 500 });
  }
}