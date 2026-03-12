import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("📨 API /snap ได้รับข้อมูลจากหน้าเว็บ:", body);

    const cameraId = body.camera_id || "CAM_ECBD8ED6CDC0"; 
    
    // 🛑 กลับมายิงเข้า Cloud Run ให้ไปอัปเดต DB
    const backendUrl = `https://farmbrain-bridge-81675649311.asia-southeast1.run.app/update-config`;
    
    console.log(`🚀 กำลังเตรียมยิงไป Cloud Run ด้วย camera_id: ${cameraId}`);

    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        camera_id: cameraId, 
        action: "snap"        
      }),
    });

    console.log(`☁️ Cloud Run ตอบกลับมาว่า: Status ${res.status}`);

    if (res.ok) {
      return NextResponse.json({ success: true, message: 'Snap triggered in DB' });
    } else {
      const errText = await res.text();
      console.error(`❌ Cloud Run Error:`, errText);
      return NextResponse.json({ error: 'Backend failed' }, { status: res.status });
    }

  } catch (error) {
    console.error("🔥 Snap API พัง:", error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}