// src/app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import bigquery from '@/lib/bigquery';
import { hash } from 'bcrypt';

export async function POST(request) {
  try {
    const { name, email, phone, password } = await request.json();

    // 🛑 1. เช็คก่อนว่ามีอีเมลหรือเบอร์โทรนี้ในระบบหรือยัง
    const checkQuery = `
      SELECT email, phone 
      FROM \`smart-farm-c9d48.smartfarm.users\` 
      WHERE email = @email OR phone = @phone
      LIMIT 1
    `;
    
    const [existingUsers] = await bigquery.query({
      query: checkQuery,
      params: { email: email, phone: phone }
    });

    // 🚨 ถ้าเจอว่ามีข้อมูลอยู่แล้ว ให้ตีกลับพร้อมแจ้งเตือน
    if (existingUsers && existingUsers.length > 0) {
      const user = existingUsers[0];
      if (user.email === email) {
        return NextResponse.json({ error: 'อีเมลนี้ถูกใช้งานแล้วจ้า ลองใช้อีเมลอื่นนะ' }, { status: 400 });
      }
      if (user.phone === phone) {
        return NextResponse.json({ error: 'เบอร์โทรศัพท์นี้ถูกลงทะเบียนไปแล้วจ้า' }, { status: 400 });
      }
    }

    // ✅ 2. ถ้าข้อมูลคลีน (ไม่ซ้ำใคร) ค่อยดำเนินการสร้าง User ใหม่
    const randomChars =  Math.floor(1000 + Math.random() * 9000);
    const user_id = `user-${randomChars}`;

    const hashedPassword = await hash(password, 10);

    const insertQuery = `
      INSERT INTO \`smart-farm-c9d48.smartfarm.users\` 
        (user_id, name, email, phone, password)
      VALUES 
        (@user_id, @name, @email, @phone, @password)
    `;  

    await bigquery.query({
      query: insertQuery,
      params: { 
        user_id: user_id, 
        name: name, 
        email: email, 
        phone: phone, 
        password: hashedPassword 
      } 
    });

    return NextResponse.json({ 
      success: true, 
      user_id: user_id,
      deviceId: null, 
    });

  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: 'สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}