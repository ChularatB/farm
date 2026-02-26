import { NextResponse } from 'next/server';
import bigquery from '@/lib/bigquery';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, email, phone } = await request.json();
    const oldEmail = session.user.email; 

    const query = `
      UPDATE \`smart-farm-c9d48.smartfarm.users\`
      SET name = @name, email = @email, phone = @phone
      WHERE email = @oldEmail
    `;

    await bigquery.query({
      query,
      params: { name, email, phone, oldEmail }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}