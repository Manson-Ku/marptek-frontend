'use client'

import { useTranslations } from 'next-intl'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useSession } from 'next-auth/react'
import { Book } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
// 1. 直接 import Sidebar 的配置
import { sidebarGroups } from '@/components/Sidebar'

export default function Header({ onProfileClick }) {
  const t = useTranslations('Sidebar') // ← sidebar 分組與項目都在 Sidebar 命名空間
  const { data: session } = useSession()
  const pathname = usePathname()

  // 取得當前路徑對應 sidebar title（支援 group + item）
  function getSidebarTitle(pathname) {
    for (const group of sidebarGroups) {
      for (const item of group.items) {
        if (item.href === pathname) {
          return t(item.key)
        }
      }
    }
    // fallback：首頁
    if (pathname === '/' || pathname.startsWith('/dashboard')) return t('summary')
    // fallback: 自定義
    return ''
  }

  // 教學中心
  function HelpDropdown() {
    const [open, setOpen] = useState(false)
    const dropdownRef = useRef(null)

    useEffect(() => {
      function handleClick(e) {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
          setOpen(false)
        }
      }
      if (open) document.addEventListener('mousedown', handleClick)
      else document.removeEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }, [open])

    const items = [
      { key: 'knowledgeBase', label: '知識庫', href: '/help/knowledge-base' },
      { key: 'qa', label: '操作說明（QA）', href: '/help/qa' },
      { key: 'tutorials', label: '教學影片', href: '/help/tutorials' },
      { key: 'webinars', label: '線上講座', href: '/help/webinars' },
      { key: 'faq', label: '常見問題', href: '/help/faq' },
      { key: 'support', label: '線上客服/支援聯絡', href: '/help/support' },
    ]

    return (
      <div className="help-dropdown" ref={dropdownRef}>
        <button
          className="help-dropdown-btn"
          onClick={() => setOpen(v => !v)}
          type="button"
          aria-haspopup="true"
          aria-expanded={open}
        >
          <Book size={18} style={{ marginRight: 4 }} />
          教學中心
          <span style={{ marginLeft: 2 }}>{open ? '▲' : '▼'}</span>
        </button>
        {open && (
          <div className="help-dropdown-menu">
            {items.map(item => (
              <a key={item.key} href={item.href} className="help-dropdown-item">
                {item.label}
              </a>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <header className="header">
      <div className="header-title">
        {getSidebarTitle(pathname) || '－'}
      </div>
      <div className="header-actions">
        <HelpDropdown />
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
