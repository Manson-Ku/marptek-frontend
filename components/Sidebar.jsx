'use client'

import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import {
  Home, LayoutDashboard, Store, MessageSquare, Star, Bot, QrCode, BellRing,
  BarChart3, KeyRound, FileText, ListOrdered, Sparkles, ShieldCheck, Info, Landmark, Link, Image, Trophy, MapPin, TrendingUp, Settings, Brain, Megaphone, LocateFixed
} from 'lucide-react'
import { useState, useEffect } from 'react'

/**
 * sidebarGroups: 專門 export 給 Header、Sidebar、Breadcrumb 等其他元件用
 * icon 跟 label 不 export（label 交由 t()，icon 由 map 補）
 */
export const sidebarGroups = [
  {
    key: 'overview',
    items: [
      { key: 'summary', href: '/' }
    ]
  },
  {
    key: 'businessProfile',
    items: [
      { key: 'locationHealthCheck', href: '/section_locations/locationHealthCheck' },
      { key: 'basicInfoManagement', href: '/section_locations/basicInfoManagement' },
      { key: 'propertyManagement', href: '/section_locations/propertyManagement' },
      { key: 'linkManagement', href: '/section_locations/linkManagement' },
      { key: 'imageManagement', href: '/section_locations/imageManagement' }
    ]
  },
  {
    key: 'reputation',
    items: [
      { key: 'googleQA', href: '/section_reviews/googleQA' },
      { key: 'reviews', href: '/section_reviews/reviews' },
      { key: 'autoResponse', href: '/section_reviews/autoResponse' },
      { key: 'reviewInvite', href: '/section_reviews/reviewInvite' },
      { key: 'reviewNotifier', href: '/section_reviews/reviewNotifier' }
    ]
  },
  {
    key: 'marketingTools',
    items: [
      { key: 'postList', href: '/section_posts/postList' },
      { key: 'postBatch', href: '/section_posts/postBatch' },
      { key: 'postGenerator', href: '/section_posts/postGenerator' }
    ]
  },
  {
    key: 'analytics',
    items: [
      { key: 'performance', href: '/section_performance/performance' },
      { key: 'keyword', href: '/section_performance/keyword' }
    ]
  },
  {
    key: 'ranking',
    items: [
      { key: 'localRank', href: '/section_ranking/localRank' },
      { key: 'localSeo', href: '/section_ranking/localSeo' }
    ]
  },
  {
    key: 'aiAdvisor',
    items: [
      { key: 'storeSuggestion', href: '/section_aiAdvisor/storeSuggestion' },
      { key: 'localMarketing', href: '/section_aiAdvisor/localMarketing' },
      { key: 'addresSuggestion', href: '/section_aiAdvisor/addresSuggestion' }
    ]
  }
]

// icon, groupIcon: key 對應表
const groupIcons = {
  overview: <Home size={20} />,
  businessProfile: <Store size={20} />,
  reputation: <MessageSquare size={20} />,
  marketingTools: <Sparkles size={20} />,
  analytics: <BarChart3 size={20} />,
  ranking: <Trophy size={20} />,
  aiAdvisor: <Brain size={20} />
}
const itemIcons = {
  summary: <LayoutDashboard size={18} />,
  locationHealthCheck: <ShieldCheck size={18} />,
  basicInfoManagement: <Info size={18} />,
  propertyManagement: <Landmark size={18} />,
  linkManagement: <Link size={18} />,
  imageManagement: <Image size={18} />,
  googleQA: <MessageSquare size={18} />,
  reviews: <Star size={18} />,
  autoResponse: <Bot size={18} />,
  reviewInvite: <QrCode size={18} />,
  reviewNotifier: <BellRing size={16} />,
  postList: <FileText size={18} />,
  postBatch: <ListOrdered size={18} />,
  postGenerator: <Sparkles size={18} />,
  performance: <BarChart3 size={18} />,
  keyword: <KeyRound size={18} />,
  localRank: <MapPin size={18} />,
  localSeo: <TrendingUp size={18} />,
  storeSuggestion: <BarChart3 size={18} />,
  localMarketing: <Megaphone size={18} />,
  addresSuggestion: <LocateFixed size={18} />
}

// 點擊次數記錄
function recordSidebarUsage(key) {
  if (typeof window === 'undefined') return
  const stats = JSON.parse(localStorage.getItem('sidebarUsage') || '{}')
  stats[key] = (stats[key] || 0) + 1
  localStorage.setItem('sidebarUsage', JSON.stringify(stats))
}
function getTopUsages(n = 5) {
  if (typeof window === 'undefined') return []
  const stats = JSON.parse(localStorage.getItem('sidebarUsage') || '{}')
  return Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key]) => key)
}

export default function Sidebar() {
  const t = useTranslations('Sidebar')
  const pathname = usePathname()
  const [openKeys, setOpenKeys] = useState([])
  const [topUsageKeys, setTopUsageKeys] = useState([])

  // 攤平成一維所有子項
  const allItemsFlat = sidebarGroups.flatMap(g => g.items)
  const topUsageItems = allItemsFlat.filter(item => topUsageKeys.includes(item.key) && item.key !== 'summary')

  useEffect(() => {
    setTopUsageKeys(getTopUsages(5))
  }, [pathname])

  // 自動展開有 active 的 group
  useEffect(() => {
    for (let group of sidebarGroups) {
      if (group.items.some(item => pathname === item.href)) {
        setOpenKeys(prev => prev.includes(group.key) ? prev : [...prev, group.key])
        return
      }
    }
  }, [pathname])

  function handleSidebarClick(item) {
    recordSidebarUsage(item.key)
  }
  function handleGroupToggle(groupKey) {
    setOpenKeys(prev =>
      prev.includes(groupKey)
        ? prev.filter(key => key !== groupKey)
        : [...prev, groupKey]
    )
  }

  return (
    <div className="sidebar">
      {/* LOGO */}
      <div className="sidebar-top">
        <img src="/logo-marptek.png" alt="MARPTEK" width="120" />
      </div>

      <div className="sidebar-middle">
        {sidebarGroups.map(group => {
          // overview分組特殊插入
          let groupItems = group.items
          if (group.key === 'overview' && openKeys.includes('overview')) {
            // summary + divider + 常用
            groupItems = [
              group.items[0],
              ...(topUsageItems.length > 0
                ? [
                  { key: '__fav_divider__' },
                  ...topUsageItems
                ] : []
              )
            ]
          }

          return (
            <div key={group.key}>
              <button
                className={`sidebar-group-btn${openKeys.includes(group.key) ? ' active' : ''}`}
                onClick={() => handleGroupToggle(group.key)}
                aria-expanded={openKeys.includes(group.key)}
                aria-controls={`sidebar-group-${group.key}`}
                type="button"
              >
                <span className="icon">{groupIcons[group.key]}</span>
                <span>{t(group.key)}</span>
                <span className="arrow">{openKeys.includes(group.key) ? '▲' : '▼'}</span>
              </button>
              {openKeys.includes(group.key) && groupItems.length > 0 && (
                <nav id={`sidebar-group-${group.key}`}>
                  {groupItems.map((item, idx) =>
                    item.key === '__fav_divider__' ? (
                      <div key="fav-divider" className="sidebar-fav-divider">
                        <span className="sidebar-fav-star">★</span>
                        <span className="sidebar-fav-title">{t('favoriteShortcuts') || '常用功能'}</span>
                      </div>
                    ) : (
                      <a
                        key={item.key}
                        href={item.href}
                        className={pathname === item.href ? 'active' : ''}
                        onClick={() => handleSidebarClick(item)}
                        style={item.key !== 'summary' && group.key === 'overview' && topUsageItems.find(i => i.key === item.key) ? { fontSize: '0.95em', opacity: 0.94, paddingLeft: '2.2rem' } : undefined}
                      >
                        {itemIcons[item.key]}
                        <span>{t(item.key)}</span>
                      </a>
                    )
                  )}
                </nav>
              )}
            </div>
          )
        })}
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
