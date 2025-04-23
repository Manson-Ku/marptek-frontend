'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (e) => {
    const selectedLocale = e.target.value;
    if (typeof selectedLocale === 'string') {
      localStorage.setItem('locale', selectedLocale);
      window.location.reload(); // ✅ 加這行，強制 reload
    }
  };

  return (
    <select
      onChange={handleChange}
      defaultValue={typeof window !== 'undefined' ? (localStorage.getItem('locale') || 'zh-TW') : 'zh-TW'}
      style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' }}
    >
      <option value="zh-TW">繁體中文</option>
      <option value="en-US">English</option>
    </select>
  );
}
