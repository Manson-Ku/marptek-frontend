'use client';

import { useTranslations } from 'next-intl'; // ✅ 引入 next-intl
// 或如果你用自己的 t()，也可以改成 import { useLocale } from '@/components/LocaleProvider'

export default function Sidebar() {
  const t = useTranslations('Sidebar'); // ✅ 這次明確指定命名空間

  const menuItems = [
    { key: 'dashboard', href: '#' },
    { key: 'performance', href: '#' },
    { key: 'reviews', href: '#' },
    { key: 'autoResponse', href: '#' },
    { key: 'googleQA', href: '#' },
    { key: 'locations', href: '#' },
    { key: 'competitors', href: '#' },
    { key: 'manageLocations', href: '#' },
    { key: 'posts', href: '#' },
    { key: 'imageManagement', href: '#' },
    { key: 'reviewShowcase', href: '#' }
  ];

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">MARPTEK</h2>
      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <a key={index} href={item.href} className="sidebar-link">
            {t(item.key)}
          </a>
        ))}
      </nav>
    </div>
  );
}
