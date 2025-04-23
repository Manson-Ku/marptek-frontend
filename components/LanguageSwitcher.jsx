'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [locale, setLocale] = useState('zh-TW'); // 預設語言

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('locale');
      if (stored) setLocale(stored);
    }
  }, []);

  const handleChange = (e) => {
    const selectedLocale = e.target.value;
    if (typeof selectedLocale === 'string') {
      localStorage.setItem('locale', selectedLocale);
      window.location.reload(); // 強制 reload
    }
  };

  return (
    <select
      onChange={handleChange}
      value={locale}
      style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' }}
    >
      <option value="zh-TW">繁體中文</option>
      <option value="en-US">English</option>
    </select>
  );
}
