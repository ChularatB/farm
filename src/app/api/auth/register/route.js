// src/app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import bigquery from '@/lib/bigquery';
import { hash } from 'bcrypt'; // ✅ นำเข้าฟังก์ชันเข้ารหัส

export async function POST(request) {
  try {
    const { name, email, phone, password } = await request.json();

    const randomChars =  Math.floor(1000 + Math.random() * 9000);
    const user_id = `user-${randomChars}`;

    const hashedPassword = await hash(password, 10);

    const query = `
      INSERT INTO \`smart-farm-c9d48.smartfarm.users\` 
        (user_id, name, email, phone, password)
      VALUES 
        (@user_id, @name, @email, @phone, @password)
    `;  

    await bigquery.query({
      query,
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
    return NextResponse.json({ error: 'สมัครสมาชิกไม่สำเร็จ' }, { status: 500 });
  }
}