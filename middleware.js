import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: '/login', // ✅ 未登入時，導到乾淨的 /login
  },
});

export const config = {
  matcher: [
    '/',              // 保護首頁
    '/dashboard/:path*', // 保護 Dashboard 全區
  ],
};
