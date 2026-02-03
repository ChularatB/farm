import { NextResponse } from 'next/server';
import bigquery from '@/lib/bigquery';

export async function GET() {
  try {
    // 🔍 ลองเปลี่ยนชื่อตารางให้ตรงกับของแกเป๊ะๆ นะ
    const query = `
      SELECT image_url 
      FROM \`smart-farm-c9d48.smart_farm_data.farm_photos\` 
      WHERE image_url IS NOT NULL 
      ORDER BY timestamp DESC 
      LIMIT 1
    `;
    
    const [rows] = await bigquery.query(query);

    console.log("Rows from BigQuery:", rows); // ดูค่าใน Console ของ VS Code

    if (rows && rows.length > 0) {
      return NextResponse.json({ imageUrl: rows[0].image_url });
    } else {
      return NextResponse.json({ imageUrl: null, message: "No image found" });
    }
  } catch (error) {
    console.error("BigQuery API Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}