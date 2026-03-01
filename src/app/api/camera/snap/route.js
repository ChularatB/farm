// src/app/api/snap/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const cameraId = body.camera_id;

    if (!cameraId) {
      return NextResponse.json({ error: 'Missing camera_id' }, { status: 400 });
    }

    const backendUrl = `https://farmbrain-bridge-81675649311.asia-southeast1.run.app/update-config`;

    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        device_id: cameraId, // แปลงร่างเป็น device_id ส่งให้ Cloud Run
        action: "snap"       
      }),
    });

    if (res.ok) {
      return NextResponse.json({ success: true, message: 'Snap triggered' });
    } else {
      return NextResponse.json({ error: 'Backend failed to process' }, { status: res.status });
    }

  } catch (error) {
    console.error("🔥 Snap API Error:", error.message);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}