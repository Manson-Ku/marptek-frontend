import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/login', // 👈 未登入者一律跳這頁
  },
})

export const config = {
  matcher: [
    '/',                  // 保護首頁
    '/dashboard/:path*',  // 保護 Dashboard 全區
    '/account/:path*',    // ✅ 未來如果有帳戶管理頁也加進來
    // 可以再補 '/api/protected/*' 等等
  ],
}
