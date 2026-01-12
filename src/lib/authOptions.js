// src/lib/authOptions.js
import CredentialsProvider from "next-auth/providers/credentials";
import bigquery from '@/lib/bigquery';
import { compare } from 'bcrypt';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน');
        }

        try {
          // ดึง device_id มาด้วย! เพื่อเอาไปใช้ Query ข้อมูลฟาร์ม
          const query = `
            SELECT email, name, password, device_id 
            FROM \`smart-farm-c9d48.smartfarm.users\` 
            WHERE email = @email
            LIMIT 1
          `;
          
          const [rows] = await bigquery.query({
            query,
            params: { email: credentials.username }
          });

          const user = rows[0];

          if (!user || !(await compare(credentials.password, user.password))) {
             throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
          }

          return { 
            id: user.email, 
            name: user.name, 
            email: user.email,
            device_id: user.device_id // ส่ง device_id กลับไปด้วย
          };

        } catch (error) {
          console.error("Login Error:", error);
          return null;
        }
      }
    })
  ],
  pages: { signIn: '/login' },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub; 
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.device_id = token.device_id; // ยัด device_id ใส่ Session
      }
      return session;
    },
    async jwt({ token, user }) {
        if (user) {
            token.name = user.name;
            token.email = user.email;
            token.device_id = user.device_id; // รับจาก authorize
        }
        return token;
    }
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};