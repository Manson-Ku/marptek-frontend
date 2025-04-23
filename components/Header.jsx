'use client'

import { useTranslations } from 'next-intl'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useSession } from 'next-auth/react'

export default function Header({ onProfileClick }) {
  const t = useTranslations('Header')
  const { data: session } = useSession()

  return (
    <header className="header">
      <div className="header-title">{t('dashboard')}</div>

      <div className="header-actions">
        <div className="language-switcher-mini">
          <LanguageSwitcher />
        </div>
        <button onClick={onProfileClick} className="header-profile-button">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt="User Avatar"
              className="header-profile-avatar"
              style={{ borderRadius: '50%', width: 32, height: 32 }}
            />
          ) : (
            <span className="header-profile-avatar" />
          )}
        </button>
      </div>
    </header>
  )
}
