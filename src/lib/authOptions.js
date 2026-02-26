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
          // ✅ เติม device_id กลับมาให้ด้วย จะได้ไม่มีปัญหากับหน้ากล้อง
          const query = `
            SELECT user_id, email, phone, name, password, device_id
            FROM \`smart-farm-c9d48.smartfarm.users\` 
            WHERE email = @email
            LIMIT 1
          `;
          
          const [rows] = await bigquery.query({
            query,
            params: { email: credentials.username }
          });

          const user = rows[0];

          // เช็ครหัสผ่านที่เข้ารหัสไว้
          if (!user || !(await compare(credentials.password, user.password))) {
             throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
          }

          return { 
            id: user.user_id || user.email,
            user_id: user.user_id, 
            email: user.email, 
            name: user.name, 
            phone: user.phone,
            device_id: user.device_id, // ✅ คืนค่า device_id กลับไป
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
    async jwt({ token, user }) {
        if (user) {
            token.user_id = user.user_id; 
            token.name = user.name;
            token.phone = user.phone;
            token.email = user.email;
            token.device_id = user.device_id; // ✅ ใส่ใน Token
        }
        return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub; 
        session.user.user_id = token.user_id; 
        session.user.name = token.name;
        session.user.phone = token.phone;
        session.user.email = token.email;
        session.user.device_id = token.device_id; // ✅ ส่งไปให้หน้าเว็บใช้
      }
      return session;
    }
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};