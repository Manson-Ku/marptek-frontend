'use client'

import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import {
  Home, Store, MessageSquare, Star, Bot, QrCode, BellRing,
  BarChart3, KeyRound, FileText, ListOrdered, Sparkles, ShieldCheck, Info, Landmark, Link, Image, Trophy, MapPin, TrendingUp, Settings, Brain
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Sidebar() {
  const t = useTranslations('Sidebar')
  const pathname = usePathname()
  const [openKey, setOpenKey] = useState(null)

  const groups = [
    {
      key: 'overview',
      icon: <Home size={20} />,
      label: t('overview'),
      items: [
        { key: 'summary', href: '/', icon: <Home size={18} /> }
      ]
    },
    {
      key: 'businessProfile',
      icon: <Store size={20} />,
      label: t('businessProfile'),
      items: [
        { key: 'locationHealthCheck', href: '/section_locations/locationHealthCheck', icon: <ShieldCheck size={18} /> },
        { key: 'basicInfoManagement', href: '/section_locations/basicInfoManagement', icon: <Info size={18} /> },
        { key: 'propertyManagement', href: '/section_locations/propertyManagement', icon: <Landmark size={18} /> },
        { key: 'linkManagement', href: '/section_locations/linkManagement', icon: <Link size={18} /> },
        { key: 'imageManagement', href: '/section_locations/imageManagement', icon: <Image size={18} /> },
      ]
    },
    {
      key: 'reputation',
      icon: <MessageSquare size={20} />,
      label: t('reputation'),
      items: [
        { key: 'googleQA', href: '/section_reviews/googleQA', icon: <MessageSquare size={18} /> },
        { key: 'reviews', href: '/section_reviews/reviews', icon: <Star size={18} /> },
        { key: 'autoResponse', href: '/section_reviews/autoResponse', icon: <Bot size={18} /> },
        { key: 'reviewInvite', href: '/section_reviews/reviewInvite', icon: <QrCode size={18} /> },
        { key: 'reviewNotifier', href: '/section_reviews/reviewNotifier', icon: <BellRing size={16} /> },
      ]
    },
    {
      key: 'marketingTools',
      icon: <Sparkles size={20} />,
      label: t('marketingTools'),
      items: [
        { key: 'postList', href: '/section_posts/postList', icon: <FileText size={18} /> },
        { key: 'postBatch', href: '/section_posts/postBatch', icon: <ListOrdered size={18} /> },
        { key: 'postGenerator', href: '/section_posts/postGenerator', icon: <Sparkles size={18} /> },
      ]
    },
    {
      key: 'analytics',
      icon: <BarChart3 size={20} />,
      label: t('analytics'),
      items: [
        { key: 'performance', href: '/section_performance/performance', icon: <BarChart3 size={18} /> },
        { key: 'keyword', href: '/section_performance/keyword', icon: <KeyRound size={18} /> },
      ]
    },
    {
      key: 'ranking',
      icon: <Trophy size={20} />,
      label: t('ranking'),
      items: [
        { key: 'localRank', href: '/section_ranking/localRank', icon: <MapPin size={18} /> },
        { key: 'localSeo', href: '/section_ranking/localSeo', icon: <TrendingUp size={18} /> },
      ]
    },
    {
      key: 'aiAdvisor',
      icon: <Brain size={20} />,
      label: t('aiAdvisor'),
      items: [
        // 這裡可日後再補 AI 顧問相關細項
      ]
    }
  ]

  // 自動展開 active group
  useEffect(() => {
    for (let group of groups) {
      if (group.items.some(item => pathname === item.href)) {
        setOpenKey(group.key)
        return
      }
    }
    setOpenKey(null)
  }, [pathname])

  return (
    <div className="sidebar">
      {/* LOGO */}
      <div className="sidebar-top">
        <img src="/logo-marptek.png" alt="MARPTEK" width="120" />
      </div>

      <div className="sidebar-middle">
        {groups.map(group => (
          <div key={group.key}>
            <button
              className={`sidebar-group-btn${openKey === group.key ? ' active' : ''}`}
              onClick={() => setOpenKey(openKey === group.key ? null : group.key)}
              aria-expanded={openKey === group.key}
              aria-controls={`sidebar-group-${group.key}`}
              type="button"
            >
              <span className="icon">{group.icon}</span>
              <span>{group.label}</span>
              <span className="arrow">{openKey === group.key ? '▲' : '▼'}</span>
            </button>
            {openKey === group.key && group.items.length > 0 && (
              <nav id={`sidebar-group-${group.key}`}>
                {group.items.map(item => (
                  <a
                    key={item.key}
                    href={item.href}
                    className={pathname === item.href ? 'active' : ''}
                  >
                    {item.icon}
                    <span>{t(item.key)}</span>
                  </a>
                ))}
              </nav>
            )}
          </div>
        ))}
      </div>

      {/* 設定 */}
      <div className="sidebar-bottom">
        <a
          href="/settings"
          className="sidebar-settings-icon"
        >
          <Settings size={20} />
        </a>
      </div>
    </div>
  )
}
