// src/app/api/user/update/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions'; // แก้ path ให้ตรงกับที่แกเก็บนะ
import bigquery from '@/lib/bigquery';

export async function POST(request) {
  try {
    console.log("▶️ 1. API อัปเดตโปรไฟล์เริ่มทำงาน...");
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const userId = session.user.user_id;
    
    console.log("▶️ 2. ข้อมูลที่ได้รับจากหน้าเว็บ:", data);

    const query = `
      UPDATE \`smart-farm-c9d48.smartfarm.users\`
      SET 
        name = @name, 
        email = @email, 
        phone = @phone, 
        line_user_id = @line_user_id
      WHERE user_id = @user_id
    `;

    // 🛑 เคล็ดลับคือตรงนี้! เราเปลี่ยนจาก || null เป็น || "" (ข้อความว่าง)
    // แล้วลบก้อน types: {...} ทิ้งไปให้หมดเลย! BigQuery จะไม่งอแงอีกต่อไป
    await bigquery.query({
      query: query,
      params: {
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        line_user_id: data.line_user_id || "",
        user_id: userId
      }
    });

    console.log("▶️ 3. บันทึกลง BigQuery สำเร็จ!");
    return NextResponse.json({ success: true, message: 'อัปเดตข้อมูลสำเร็จ' });

  } catch (error) {
    console.error("❌ Update User Error:", error);
    // ส่ง Error กลับไปให้หน้าเว็บ จะได้ไม่หมุนค้าง
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}