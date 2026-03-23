import { NextResponse } from 'next/server';
import bigquery from '@/lib/bigquery';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, email, phone, line_user_id } = await request.json();
    
    // ใช้ user_id เป็นตัวค้นหาแทนอีเมล
    const user_id = session.user.user_id; 

    const query = `
      UPDATE \`smart-farm-c9d48.smartfarm.users\`
      SET name = @name, email = @email, phone = @phone, line_user_id = @line_user_id
      WHERE user_id = @user_id
    `;

    await bigquery.query({
      query,
      params: { name, email, phone, user_id, line_user_id: line_user_id || null }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}