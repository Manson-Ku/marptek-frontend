'use client'

import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import {
  Home, Store, MessageSquare, Star, Bot, QrCode, BellRing,
  BarChart3, KeyRound, FileText, ListOrdered, Sparkles, ShieldCheck, Info, Landmark, Link, Image, Radar, Globe2, MapPin, TrendingUp, Settings, Trophy, Brain
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Sidebar() {
  const t = useTranslations('Sidebar')
  const pathname = usePathname()
  const [openKey, setOpenKey] = useState(null)

  // 把你原本的 sidebar item 照順序包到新分組（分錯也沒關係！）
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
        // 你可以之後再補這一組內容
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
    <div className="sidebar flex flex-col h-full bg-white shadow">
      {/* LOGO */}
      <div className="sidebar-top p-4 flex items-center justify-center">
        <img src="/logo-marptek.png" alt="MARPTEK" width="120" />
      </div>

      <div className="sidebar-middle flex-1 px-2 overflow-y-auto">
        {groups.map(group => (
          <div key={group.key} className="mb-2">
            <button
              className={`flex items-center w-full py-2 px-3 rounded-lg hover:bg-gray-100 transition ${openKey === group.key ? 'bg-gray-100' : ''}`}
              onClick={() => setOpenKey(openKey === group.key ? null : group.key)}
              aria-expanded={openKey === group.key}
              aria-controls={`sidebar-group-${group.key}`}
            >
              {group.icon}
              <span className="ml-3 font-bold">{group.label}</span>
              <span className="ml-auto">{openKey === group.key ? '▲' : '▼'}</span>
            </button>
            {openKey === group.key && (
              <nav id={`sidebar-group-${group.key}`}>
                {group.items.map(item => (
                  <a
                    key={item.key}
                    href={item.href}
                    className={`flex items-center py-2 pl-10 pr-3 rounded-lg text-sm hover:bg-blue-50 transition ${
                      pathname === item.href ? 'bg-blue-100 font-bold text-blue-700' : ''
                    }`}
                  >
                    {item.icon}
                    <span className="ml-2">{t(item.key)}</span>
                  </a>
                ))}
              </nav>
            )}
          </div>
        ))}
      </div>

      {/* 設定 */}
      <div className="sidebar-bottom p-4">
        <a
          href="/settings"
          className={`sidebar-link flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 ${pathname.startsWith('/settings') ? 'bg-blue-100' : ''}`}
        >
          <Settings size={20} />
        </a>
      </div>
    </div>
  )
}
