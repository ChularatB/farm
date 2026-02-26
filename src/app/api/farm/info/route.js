import { NextResponse } from 'next/server';
import bigquery from '@/lib/bigquery';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // ✅ เปลี่ยนมาดึง usr_id แทน email หรือ device_id
    const user_id = session.user.usr_id;

    // กันเหนียว เผื่อ session ยังไม่มี usr_id
    if (!user_id) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
    }

    const query = `
      SELECT farm_size, total_devices, phone, use_irrigation, use_light, use_fertilizer
      FROM \`smart-farm-c9d48.smartfarm.users\` 
      WHERE user_id = @user_id
      LIMIT 1
    `;

    const [rows] = await bigquery.query({
      query,
      params: { user_id: user_id }
    });

    if (rows.length > 0) {
      return NextResponse.json({
        success: true,
        farm_size: rows[0].farm_size || '',
        phone: rows[0].phone || '',
        total_devices: rows[0].total_devices || '',
        use_irrigation: rows[0].use_irrigation, // ค่า Boolean (true/false)
        use_light: rows[0].use_light,
        use_fertilizer: rows[0].use_fertilizer
      });
    } else {
      return NextResponse.json({ success: true, farm_size: '', phone: '', total_devices: '', use_irrigation: true });
    }

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Database Error' }, { status: 500 });
  }
}