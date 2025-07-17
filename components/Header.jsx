'use client'

import { useTranslations } from 'next-intl'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useSession } from 'next-auth/react'
import { Book } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { sidebarGroups } from '@/components/Sidebar' // 路徑依你的專案

export default function Header({ onProfileClick }) {
  const t = useTranslations('Sidebar') // group/item key 用 Sidebar 區翻譯
  const tHeader = useTranslations('Header')
  const { data: session } = useSession()
  const pathname = usePathname()

  // 取得當前 group + item
  function findActiveGroupAndItem(path) {
    for (let group of sidebarGroups) {
      for (let item of group.items) {
        if (item.href === path) return { group, item }
      }
    }
    // fallback: 若找不到精準 match，用 prefix
    for (let group of sidebarGroups) {
      for (let item of group.items) {
        if (item.href && path.startsWith(item.href)) return { group, item }
      }
    }
    return { group: sidebarGroups[0], item: sidebarGroups[0].items[0] } // 預設 overview/summary
  }

  const { group: activeGroup, item: activeItem } = findActiveGroupAndItem(pathname)

  // 教學中心下拉
  function HelpDropdown() {
    const [open, setOpen] = useState(false)
    const dropdownRef = useRef(null)
    useEffect(() => {
      function handleClick(e) {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false)
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
        <button className="help-dropdown-btn" onClick={() => setOpen(v => !v)} type="button" aria-haspopup="true" aria-expanded={open}>
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
      <div className="header-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* group icon + item icon + 名稱 */}
        <span className="header-title-group-icon">{activeGroup.icon}</span>
        {activeItem.icon && <span className="header-title-item-icon">{activeItem.icon}</span>}
        <span>{t(activeGroup.key)} <span style={{ opacity: 0.72 }}>/</span> {t(activeItem.key)}</span>
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
