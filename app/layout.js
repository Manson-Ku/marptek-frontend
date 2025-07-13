import './globals.css'
import Providers from '@/components/Providers'
import ErrorReload from '@/components/ErrorReload' // <--- 新增這行

export const metadata = {
  title: 'MARPTEK',
  description: '地圖行銷科技 - 開店與商家決策的 AI 助手',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body>
        <Providers>
          <ErrorReload /> {/* <--- 加在最外層，全站自動生效 */}
          {children}
        </Providers>
      </body>
    </html>
  )
}
