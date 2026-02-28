// src/app/api/farm-image/route.js
import { NextResponse } from 'next/server';
import bigquery from '@/lib/bigquery';
import { getServerSession } from "next-auth"; 
import { authOptions } from "@/lib/authOptions";

export const dynamic = 'force-dynamic'; // ยันต์กันจำ Cache

export async function GET() {
  try {
    // 1. ดึงข้อมูลคนที่ล็อกอินอยู่
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.device_id) {
      return NextResponse.json({ imageUrl: null, message: "Unauthorized or No Device Linked" }, { status: 401 });
    }

    // 2. เอา device_id มาต่อกับ CAM_ เพื่อให้ตรงกับในฐานข้อมูล
    const userDeviceId = session.user.device_id;
    const camera_id = `CAM_${userDeviceId}`;

    // 🚨 3. เช็คชื่อ Dataset ดีๆ นะ! ของแกน่าจะเป็น smartfarm (ไม่ใช่ smart_farm_data)
    const query = `
      SELECT image_url 
      FROM \`smart-farm-c9d48.smartfarm.farm_photos\` 
      WHERE camera_id = @cameraId AND image_url IS NOT NULL 
      ORDER BY timestamp DESC 
      LIMIT 1
    `;
    
    const [rows] = await bigquery.query({
      query,
      params: { cameraId: camera_id } // ส่ง camera_id เข้าไปเช็ค
    });

    console.log("รูปที่หาเจอ:", rows); // เอาไว้ดูใน Terminal ว่ามันหาเจอมั้ย

    if (rows && rows.length > 0) {
      // 4. ใส่ ?t=... เพื่อหลอกเบราว์เซอร์ให้โหลดรูปใหม่เสมอ
      const freshImageUrl = `${rows[0].image_url}?t=${new Date().getTime()}`;
      return NextResponse.json({ imageUrl: freshImageUrl });
    } else {
      return NextResponse.json({ imageUrl: null, message: "No image found for this camera" });
    }

  } catch (error) {
    console.error("BigQuery API Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}