// src/app/api/farm-image/route.js
import { NextResponse } from 'next/server';
import bigquery from '@/lib/bigquery';
import { getServerSession } from "next-auth"; 
import { authOptions } from "@/lib/authOptions";

export const dynamic = 'force-dynamic'; // ยันต์กันจำ Cache

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // 🛑 เพื่อการทดสอบให้รูปขึ้น 100% เราจะ FIX ชื่อ camera_id ไปก่อนเลย!
    // *** แกแก้ตรงนี้ให้ตรงกับ camera_id ที่มีอยู่ในตาราง farm_photos ของแกจริงๆ นะ ***
    const testCameraId = "CAM_ECBD8ED6CDC0"; // 👈 เปลี่ยนชื่อนี้ให้ตรงกับในฐานข้อมูล

    console.log(`🔍 กำลังค้นหารูปของกล้อง: ${testCameraId}`);

    const query = `
      SELECT image_url 
      FROM \`smart-farm-c9d48.smartfarm.farm_photos\` 
      WHERE camera_id = @cameraId AND image_url IS NOT NULL 
      ORDER BY timestamp DESC 
      LIMIT 1
    `;
    
    const [rows] = await bigquery.query({
      query,
      params: { cameraId: testCameraId } // ส่ง testCameraId เข้าไปเช็ค
    });

    console.log("📸 รูปที่หาเจอ:", rows); // เอาไว้ดูใน Terminal

    if (rows && rows.length > 0) {
      // ใส่ ?t=... เพื่อหลอกเบราว์เซอร์ให้โหลดรูปใหม่เสมอ (ไม่เอารูปเก่าในแคช)
      const freshImageUrl = `${rows[0].image_url}?t=${new Date().getTime()}`;
      return NextResponse.json({ imageUrl: freshImageUrl });
    } else {
      return NextResponse.json({ imageUrl: null, message: "No image found for this camera" });
    }

  } catch (error) {
    console.error("🔥 BigQuery API Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}