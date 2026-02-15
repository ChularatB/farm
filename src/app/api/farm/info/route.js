import { NextResponse } from 'next/server';
import bigquery from '@/lib/bigquery';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const deviceId = session.user.device_id;

    // เลือกข้อมูลทั้งหมดที่จำเป็น
    const query = `
      SELECT farm_size, total_devices, use_irrigation, use_light, use_fertilizer
      FROM \`smart-farm-c9d48.smartfarm.users\` 
      WHERE email = @email
      LIMIT 1
    `;

    const [rows] = await bigquery.query({
      query,
      params: { email: session.user.email } // ใช้ email ชัวร์กว่าสำหรับตาราง users
    });

    if (rows.length > 0) {
      // ✅ ส่งกลับไปให้ครบทุกตัวแปร ไม่งั้นหน้าเว็บเอ๋อ
      return NextResponse.json({
        success: true,
        farm_size: rows[0].farm_size || '',
        total_devices: rows[0].total_devices || '',
        use_irrigation: rows[0].use_irrigation, // ค่า Boolean (true/false)
        use_light: rows[0].use_light,
        use_fertilizer: rows[0].use_fertilizer
      });
    } else {
      return NextResponse.json({ success: true, farm_size: '', total_devices: '', use_irrigation: true });
    }

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Database Error' }, { status: 500 });
  }
}