// app/api/control/route.js
import { NextResponse } from 'next/server';
// ต้องติดตั้งและ Import Google Cloud Pub/Sub Library
// npm install @google-cloud/pubsub
import { PubSub } from '@google-cloud/pubsub'; 

// ตรวจสอบว่า PubSub Client ใช้ GOOGLE_PROJECT_ID และ Credentials เดียวกันกับ BigQuery 
// (ถ้าตั้งค่าใน .env.local ถูกต้องแล้ว) 
const pubSubClient = new PubSub({
  projectId: process.env.GOOGLE_PROJECT_ID,
});

const TOPIC_NAME = 'farm-commands-topic'; // แก้ชื่อ Topic ให้ตรงกับของแก

export async function POST(request) {
  try {
    const body = await request.json();
    const { command } = body; // command จะเป็น 0 (เปิด) หรือ 1 (ปิด)

    // สร้าง Message ที่จะส่งไปให้ ESP32
    const message = {
      device_id: 'farm_001', // ระบุ Device ID
      action: 'irrigation',
      value: command, 
      timestamp: new Date().toISOString(),
    };

    const dataBuffer = Buffer.from(JSON.stringify(message));

    // ส่ง Message เข้า Topic ของ Pub/Sub
    const messageId = await pubSubClient.topic(TOPIC_NAME).publishMessage({data: dataBuffer});
    console.log(`Command message ${messageId} published to ${TOPIC_NAME}.`);

    return NextResponse.json({ success: true, message: 'Command sent to Pub/Sub' });

  } catch (error) {
    console.error('Pub/Sub Command Error:', error);
    return NextResponse.json({ error: 'Failed to send command' }, { status: 500 });
  }
}