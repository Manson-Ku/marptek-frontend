import './globals.css';
import Providers from '@/components/Providers'; // ✅ 引用新的 Providers.jsx

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW"><body>
      <Providers>
        {children}
      </Providers>
    </body></html>
  );
}
