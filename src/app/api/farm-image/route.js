// src/app/api/farm-image/route.js
import { NextResponse } from 'next/server';
import bigquery from '@/lib/bigquery';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const dynamic = 'force-dynamic'; // ยันต์กันจำ

export async function GET() {
  try {
    // 1. ดูว่าใครล็อกอินอยู่ แล้วดึง device_id ของคนนั้นมา
    const session = await getServerSession(authOptions);
    if (!session || !session.user.device_id) {
      return NextResponse.json({ imageUrl: null, message: "ยังไม่ได้ผูก Device ID" });
    }

    // สร้างคำว่า CAM_ นำหน้าให้ตรงกับที่บอร์ดแกส่งมา
    const camera_id = `CAM_${session.user.device_id}`; 

    // 2. 🔍 ดึงรูปเฉพาะแถวที่ camera_id ตรงกันเท่านั้น
    const query = `
      SELECT image_url 
      FROM \`smart-farm-c9d48.smartfarm.farm_photos\` 
      WHERE camera_id = @camera_id AND image_url IS NOT NULL 
      ORDER BY timestamp DESC 
      LIMIT 1
    `;
    
    const [rows] = await bigquery.query({
        query,
        params: { camera_id: camera_id } // ส่งค่าไปค้นหา
    });

    if (rows && rows.length > 0) {
      const freshImageUrl = `${rows[0].image_url}?t=${new Date().getTime()}`;
      return NextResponse.json({ imageUrl: freshImageUrl });
    } else {
      // ถ้าไม่เจอรูปของตัวเองเลย ให้ส่งค่าว่างกลับไป
      return NextResponse.json({ imageUrl: null, message: "ไม่พบรูปภาพของกล้องนี้" });
    }
  } catch (error) {
    console.error("BigQuery API Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}