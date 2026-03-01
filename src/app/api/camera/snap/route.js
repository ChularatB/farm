// src/app/api/camera/snap/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { camera_id } = await request.json();

    if (!camera_id) {
      return NextResponse.json({ error: 'Missing camera_id' }, { status: 400 });
    }

    const backendUrl = `https://farmbrain-bridge-81675649311.asia-southeast1.run.app/update-config`;
    

    // ยิงคำสั่งไปหา Backend ของแก
    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        device_id: camera_id, // ส่ง ID กล้องไป (Backend แกใช้ชื่อตัวแปร device_id)
        action: "snap"        // ส่ง action "snap" เพื่อเข้าเงื่อนไขถ่ายรูป
      }),
    });

    if (res.ok) {
      return NextResponse.json({ success: true, message: 'Snap triggered' });
    } else {
      return NextResponse.json({ error: 'Backend failed to process' }, { status: res.status });
    }

  } catch (error) {
    console.error("Snap API Error:", error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}