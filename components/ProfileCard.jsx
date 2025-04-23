'use client'

import { useTranslations } from 'next-intl'

export default function ProfileCard({ session, onLogout }) {
  const t = useTranslations('Profile')

  return (
    <div className="profile-card">
      {session.user?.image ? (
        <img
          src={session.user.image}
          alt="Avatar"
          className="profile-avatar"
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            objectFit: 'cover',
            marginBottom: '1rem',
          }}
        />
      ) : (
        <div className="profile-avatar" />
      )}

      <h3 className="profile-name">{session.user.name}</h3>
      <p className="profile-email">{session.user.email}</p>

      {session.refreshToken ? (
        <div
          style={{
            wordBreak: 'break-all',
            fontSize: '0.75rem',
            color: '#666',
            marginTop: '1rem',
            textAlign: 'center',
          }}
        >
          <div>
            <strong>Refresh Token</strong>
          </div>
          <div>{session.refreshToken}</div>
        </div>
      ) : (
        <button
          disabled
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#f1f5f9',
            color: '#64748b',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'not-allowed',
            width: '100%',
            fontWeight: 'bold',
          }}
        >
          {t('startManagingGBP')}
        </button>
      )}

      <button onClick={onLogout} className="profile-logout-button">
        {t('logout')}
      </button>
    </div>
  )
}
