import { NextResponse } from 'next/server';
import bigquery from '@/lib/bigquery';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ notifications: [] });

    // ดึง 5 แจ้งเตือนล่าสุดของ device_id นี้
    const query = `
      SELECT message, created_at, is_read
      FROM \`smart-farm-c9d48.smartfarm.notifications\`
      WHERE device_id = @deviceId
      ORDER BY created_at DESC
      LIMIT 5
    `;

    const [rows] = await bigquery.query({
        query, 
        params: { deviceId: session.user.device_id }
    });

    return NextResponse.json({ notifications: rows });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}