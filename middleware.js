// middleware.js
export { default } from "next-auth/middleware";

// ระบุว่าหน้าไหนบ้างที่ "ต้อง Login ก่อน" ถึงจะเข้าได้
export const config = {
  matcher: ["/", "/control", "/settings", "/profile", "/history"],
};