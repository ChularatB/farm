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
          // ✅ 1. เพิ่ม user_id เข้าไปใน SELECT
          const query = `
            SELECT user_id, email, phone, name, password, device_id 
            FROM \`smart-farm-c9d48.smartfarm.users\` 
            WHERE user_id = @user_id
            LIMIT 1
          `;
          
          const [rows] = await bigquery.query({
            query,
            params: { user_id: credentials.username }
          });

          const user = rows[0];

          if (!user || !(await compare(credentials.password, user.password))) {
             throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
          }

          return { 
            id: user.user_id || user.email,
            user_id: user.user_id, 
            email: user.email, 
            name: user.name, 
            phone: user.phone,
            device_id: user.device_id 
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
    // ✅ 3. เอาข้อมูลมาฝังใน Token
    async jwt({ token, user }) {
        if (user) {
            token.user_id = user.user_id; 
            token.name = user.name;
            token.phone = user.phone;
            token.email = user.email;
            token.device_id = user.device_id; 
        }
        return token;
    },
    // ✅ 4. ส่งข้อมูลจาก Token ไปให้หน้าเว็บใช้งานผ่าน Session
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub; 
        session.user.user_id = token.user_id; 
        session.user.name = token.name;
        session.user.phone = token.phone;
        session.user.email = token.email;
        session.user.device_id = token.device_id;
      }
      return session;
    }
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};