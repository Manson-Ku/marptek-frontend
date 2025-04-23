import './globals.css'
import Providers from '@/components/Providers'

export const metadata = {
  title: 'MARPTEK',
  description: '地圖行銷科技 - 開店與商家決策的 AI 助手',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
