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
          // 🛑 1. แก้ไขคำสั่ง SQL ให้ค้นหาได้ทั้งอีเมล หรือ เบอร์โทรศัพท์
          const query = `
            SELECT user_id, email, phone, name, password, device_id, line_user_id, camera_id 
            FROM \`smart-farm-c9d48.smartfarm.users\` 
            WHERE email = @username OR phone = @username
            LIMIT 1
          `;

          const [rows] = await bigquery.query({
            query,
            params: { username: credentials.username } // ใช้ตัวแปร username รับทั้งเมล/เบอร์
          });

          const user = rows[0];

          // 🛑 2. แยกเช็คให้ชัดเจนว่า ไม่มีบัญชี หรือ รหัสผิด
          if (!user) {
            throw new Error('ไม่พบบัญชีนี้ในระบบ กรุณาสมัครสมาชิกก่อน!');
          }

          if (!(await compare(credentials.password, user.password))) {
            throw new Error('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
          }

          return {
            id: user.user_id || user.email,
            user_id: user.user_id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            device_id: user.device_id,
            camera_id: user.camera_id
          };

        } catch (error) {
          // 🛑 ดึงข้อความ Error ที่เราตั้งไว้ข้างบนส่งกลับไปให้หน้าเว็บ
          throw new Error(error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
        }
      }
    })
  ],
  pages: { signIn: '/login' },
  callbacks: {
    // 🛑 เพิ่ม trigger, session เข้ามา
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.user_id = user.user_id;
        token.name = user.name;
        token.phone = user.phone;
        token.email = user.email;
        token.device_id = user.device_id;
        token.line_user_id = user.line_user_id;
        token.camera_id = user.camera_id;
      }

      // 🛑 ตรงนี้สำคัญมาก! เมื่อหน้าเว็บสั่ง update(formData) มันจะทำงานส่วนนี้
      if (trigger === "update" && session) {
        token.name = session.name;
        token.phone = session.phone;
        token.email = session.email;
        token.line_user_id = session.line_user_id;
        token.camera_id = session.camera_id;

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
        session.user.device_id = token.device_id;
        session.user.line_user_id = token.line_user_id;
        session.user.camera_id = token.camera_id;
      }
      return session;
    }
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};