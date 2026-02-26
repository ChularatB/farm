import { NextResponse } from 'next/server';
import bigquery from '@/lib/bigquery';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const user_id = session.user.user_id; // เช็คผ่าน user_id

    const query = `
      UPDATE \`smart-farm-c9d48.smartfarm.users\`
      SET 
        farm_size = CASE WHEN @farm_size IS NULL THEN farm_size ELSE @farm_size END,
        total_devices = CASE WHEN @total_devices IS NULL THEN total_devices ELSE @total_devices END,
        use_irrigation = CASE WHEN @use_irrigation IS NULL THEN use_irrigation ELSE @use_irrigation END,
        use_light = CASE WHEN @use_light IS NULL THEN use_light ELSE @use_light END,
        light_start_time = CASE WHEN @light_start_time IS NULL THEN light_start_time ELSE @light_start_time END,
        light_duration = CASE WHEN @light_duration IS NULL THEN light_duration ELSE @light_duration END,
        use_fertilizer = CASE WHEN @use_fertilizer IS NULL THEN use_fertilizer ELSE @use_fertilizer END,
        fertilizer_interval = CASE WHEN @fertilizer_interval IS NULL THEN fertilizer_interval ELSE @fertilizer_interval END
      WHERE user_id = @user_id
    `;

    const params = {
      user_id,
      farm_size: body.farm_size !== undefined ? String(body.farm_size) : null,
      total_devices: body.total_devices !== undefined ? String(body.total_devices) : null,
      use_irrigation: body.use_irrigation ?? null,
      use_light: body.use_light ?? null,
      light_start_time: body.light_start_time ?? null,
      light_duration: body.light_duration ?? null,
      use_fertilizer: body.use_fertilizer ?? null,
      fertilizer_interval: body.fertilizer_interval ?? null,
    };

    const options = {
      query,
      params,
      types: {
        user_id: 'STRING',
        farm_size: 'STRING',       
        total_devices: 'STRING',   
        use_irrigation: 'BOOL',
        use_light: 'BOOL',
        light_start_time: 'STRING',
        light_duration: 'INT64', 
        use_fertilizer: 'BOOL',
        fertilizer_interval: 'INT64' 
      }
    };

    await bigquery.query(options);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Update Error Detailed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}