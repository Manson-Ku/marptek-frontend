'use client';

import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslations } from 'next-intl'; // ✅ 加這行

export default function Header({ onProfileClick }) {
  const t = useTranslations('Header'); // ✅ 設定命名空間 "Header"

  return (
    <header className="header">
      <div className="header-title">{t('dashboard')}</div> {/* ✅ 用t */}

      <div className="header-actions">
        {/* 語言切換器 */}
        <div className="language-switcher-mini">
          <LanguageSwitcher />
        </div>
        <button onClick={onProfileClick} className="header-profile-button">
          <span className="header-profile-avatar"></span>
        </button>
      </div>
    </header>
  );
}
