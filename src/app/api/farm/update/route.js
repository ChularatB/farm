// src/app/api/farm/update/route.js
import { NextResponse } from 'next/server';
import bigquery from '@/lib/bigquery';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const email = session.user.email;

    // 1. เตรียม Query (เหมือนเดิม)
    const query = `
      UPDATE \`smart-farm-c9d48.smartfarm.users\`
      SET 
        farm_size = CASE WHEN @farm_size IS NULL THEN farm_size ELSE @farm_size END,
        total_devices = CASE WHEN @total_devices IS NULL THEN total_devices ELSE @total_devices END,
        use_irrigation = CASE WHEN @use_irrigation IS NULL THEN use_irrigation ELSE @use_irrigation END,
        use_light = CASE WHEN @use_light IS NULL THEN use_light ELSE @use_light END,
        use_fertilizer = CASE WHEN @use_fertilizer IS NULL THEN use_fertilizer ELSE @use_fertilizer END
      WHERE email = @email
    `;

    // 2. เตรียมค่า Params (แปลง undefined เป็น null)
    const params = {
      email,
      farm_size: body.farm_size !== undefined ? String(body.farm_size) : null, // แปลงเป็น String กันเหนียว
      total_devices: body.total_devices !== undefined ? String(body.total_devices) : null,
      use_irrigation: body.use_irrigation ?? null,
      use_light: body.use_light ?? null,
      use_fertilizer: body.use_fertilizer ?? null,
    };

    // ✅ 3. (จุดที่แก้) ใส่ types เพื่อบอก BigQuery ว่าถ้าเป็น null มันคือประเภทอะไร
    const options = {
      query,
      params,
      types: {
        email: 'STRING',
        farm_size: 'STRING',       
        total_devices: 'STRING',   
        use_irrigation: 'BOOL',
        use_light: 'BOOL',
        use_fertilizer: 'BOOL'
      }
    };

    // ส่งคำสั่ง
    await bigquery.query(options);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Update Error Detailed:", error); // ให้มันปริ้นท์ Error ละเอียดๆ ใน Terminal
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}