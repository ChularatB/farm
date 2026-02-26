// src/app/api/sensors/route.js
import { NextResponse } from 'next/server';
import bigquery from '@/lib/bigquery';
import { getServerSession } from "next-auth"; // ตัวดึง Session ฝั่ง Server
import { authOptions } from "@/lib/authOptions"; // ตัวตั้งค่าที่เราแยกไว้

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.device_id) {
      return NextResponse.json({ error: 'Unauthorized or No Devic5e Linked' }, { status: 401 });
    }

    const userDeviceId = session.user.device_id;

    const query = `
      SELECT 
        temperature, 
        humidity, 
        soil_moisture, 
        pump_status, 
        timestamp
      FROM \`smart-farm-c9d48.smartfarm.sensors\`
      WHERE device_id = @deviceId
      ORDER BY timestamp DESC
      LIMIT 100
    `;

    const [rows] = await bigquery.query({
      query,
      params: { deviceId: userDeviceId }
    });

    const formattedData = rows.map(row => ({
      ...row,
      timestamp: row.timestamp.value || row.timestamp, 
    }));

    return NextResponse.json({ data: formattedData });

  } catch (error) {
    console.error('BigQuery Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}