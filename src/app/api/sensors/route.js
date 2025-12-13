import { NextResponse } from 'next/server';
import bigquery from '@/lib/bigquery';

export async function GET() {
  try {
    // 1. กำหนด Query (แก้ชื่อ dataset กับ table ให้ตรงของแกนะ)
    // Query นี้ดึงข้อมูล 100 แถวล่าสุด เรียงตามเวลา
    const query = `
      SELECT 
        temperature, 
        humidity, 
        soil_moisture, 
        pump_status, 
        timestamp
      FROM \`smart-farm-c9d48.smartfarm.sensors\`
      ORDER BY timestamp DESC
      LIMIT 100
    `;

    // 2. รัน Query
    const [rows] = await bigquery.query(query);

    // 3. แปลงวันที่ให้เป็น Format ที่ใช้งานง่าย (Optional)
    const formattedData = rows.map(row => ({
      ...row,
      // แปลง BigQuery Timestamp เป็น String
      timestamp: row.timestamp.value || row.timestamp, 
    }));

    return NextResponse.json({ data: formattedData });

  } catch (error) {
    console.error('BigQuery Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}