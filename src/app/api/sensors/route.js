// src/app/api/sensors/route.js
import { NextResponse } from 'next/server';
import bigquery from '@/lib/bigquery';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.device_id) {
      return NextResponse.json({ error: 'Unauthorized or No Device Linked' }, { status: 401 });
    }

    const userDeviceId = session.user.device_id;
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '24H';

    let timeCondition = '';
    let limit = 100;

    // ✅ ปลดล็อก LIMIT ให้เยอะพอที่จะกวาดข้อมูลข้ามวันได้
    if (range === '1H') {
      timeCondition = 'AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR)';
      limit = 500; 
    } else if (range === '24H') {
      timeCondition = 'AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)';
      limit = 10000; // ตีเผื่อเซนเซอร์ส่งถี่
    } else if (range === '7D') {
      timeCondition = 'AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)';
      limit = 50000; // กวาดมาทั้งอาทิตย์
    } else if (range === '30D') {
      timeCondition = 'AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)';
      limit = 100000; 
    } else if (range === 'ALL') {
      timeCondition = ''; 
      limit = 100000; 
    }

    const query = `
      SELECT temperature, humidity, soil_moisture, pump_status, timestamp
      FROM \`smart-farm-c9d48.smartfarm.sensors\`
      WHERE device_id = @deviceId
        ${timeCondition}
      ORDER BY timestamp DESC
      LIMIT ${limit}
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