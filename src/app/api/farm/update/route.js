// src/app/api/farm/update/route.js
import { NextResponse } from 'next/server';
import bigquery from '@/lib/bigquery';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { farm_size, total_devices } = await request.json();
    const deviceId = session.user.device_id; 

    const query = `
      MERGE \`smart-farm-c9d48.smartfarm.farm_settings\` T
      USING (SELECT @deviceId as device_id, @size as farm_size, @total as total_devices) S
      ON T.device_id = S.device_id
      WHEN MATCHED THEN
        UPDATE SET farm_size = S.farm_size, total_devices = S.total_devices
      WHEN NOT MATCHED THEN
        INSERT (device_id, farm_size, total_devices) VALUES (S.device_id, S.farm_size, S.total_devices)
    `;

    await bigquery.query({
      query,
      params: { 
        deviceId: deviceId, 
        size: parseFloat(farm_size), 
        total: parseInt(total_devices) 
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Update Failed' }, { status: 500 });
  }
}