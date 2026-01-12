// src/app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import bigquery from '@/lib/bigquery';
import { hash } from 'bcrypt';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 });
    }

    // 1. เช็คว่ามีอีเมลนี้หรือยัง
    const checkQuery = `SELECT email FROM \`smart-farm-c9d48.smartfarm.users\` WHERE email = @email`;
    const [existing] = await bigquery.query({ query: checkQuery, params: { email } });

    if (existing.length > 0) {
      return NextResponse.json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' }, { status: 400 });
    }

    // 2. เข้ารหัสรหัสผ่าน
    const hashedPassword = await hash(password, 10);

    // 3. บันทึก
    const insertQuery = `
      INSERT INTO \`smart-farm-c9d48.smartfarm.users\` (name, email, password, created_at)
      VALUES (@name, @email, @password, CURRENT_TIMESTAMP())
    `;

    await bigquery.query({
      query: insertQuery,
      params: { name, email, password: hashedPassword },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Register Error:', error);
    return NextResponse.json({ error: 'สมัครสมาชิกไม่สำเร็จ' }, { status: 500 });
  }
}