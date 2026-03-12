// ไฟล์: src/app/api/control/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";

export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("📨 API /control ได้รับข้อมูลจากหน้าเว็บ:", body);

    const deviceId = body.device_id || session.user?.device_id || "900C1AB865E4"; 
    
    // 🛑 รับค่ามาทุกอย่าง ทั้งโหมด, ปั๊มน้ำ, ไฟ, และปุ๋ย
    const opMode = body.operation_mode;
    const pumpCmd = body.pump_command;
    const lightCmd = body.light_command;
    const fertCmd = body.fertilizer_command;
    
    const backendUrl = `https://farmbrain-bridge-81675649311.asia-southeast1.run.app/update-config`;

    // 🛑 เตรียมแพ็คของ (ถ้าหน้าเว็บไม่ได้กดปุ่มไฟ มันก็จะไม่ส่งค่าไฟไปกวน Cloud Run)
    const payload = { device_id: deviceId };
    if (opMode !== undefined) payload.operation_mode = opMode;
    if (pumpCmd !== undefined) payload.pump_command = pumpCmd;
    if (lightCmd !== undefined) payload.light_command = lightCmd;
    if (fertCmd !== undefined) payload.fertilizer_command = fertCmd;

    console.log(`🚀 กำลังยิง Payload ไป Cloud Run:`, payload);

    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({ success: true, message: 'Command sent to backend', backend_response: data });
    } else {
      const errText = await res.text();
      console.error(`❌ Cloud Run Error:`, errText);
      return NextResponse.json({ error: 'Backend failed' }, { status: res.status });
    }

  } catch (error) {
    console.error("🔥 Control API พัง:", error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}