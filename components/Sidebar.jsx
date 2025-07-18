'use client'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import {
  Home, LayoutDashboard, Store, MessageSquare, Star, Bot, QrCode, BellRing,
  BarChart3, KeyRound, FileText, ListOrdered, Sparkles, ShieldCheck, Info, Landmark, Link, Image,
  Trophy, MapPin, TrendingUp, Brain, Megaphone, LocateFixed, Settings,
  Utensils, History, HelpCircle, Edit, CalendarClock, PieChart, BarChart2, Lightbulb
} from 'lucide-react'
import { useState, useEffect } from 'react'

// === 統一 Sidebar 設定（Header 也會 import 這個）===
export const sidebarGroups = [
  {
    key: 'overview',
    icon: <Home size={20} />,
    items: [
      { key: 'summary', href: '/', icon: <LayoutDashboard size={18} /> }
    ]
  },
  {
    key: 'businessProfile',
    icon: <Store size={20} />,
    items: [
      { key: 'locationManagement', href: '/section_locations/basicInfoManagement', icon: <MapPin size={18} /> },
      { key: 'locationHealthCheck', href: '/section_locations/locationHealthCheck', icon: <ShieldCheck size={18} /> },
      { key: 'imageManagement', href: '/section_locations/imageManagement', icon: <Image size={18} /> },      
      { key: 'menuManagement', href: '/section_locations/menuManagement', icon: <Utensils size={18} /> },
      { key: 'batchManagement', href: '/section_locations/batchManagement', icon: <ListOrdered size={18} /> },
    ]
  },
  {
    key: 'reputation',
    icon: <MessageSquare size={20} />,
    items: [
      { key: 'reviews', href: '/section_reviews/reviews', icon: <Star size={18} /> },
      { key: 'autoResponse', href: '/section_reviews/autoResponse', icon: <Bot size={18} /> },
      { key: 'replyLog', href: '/section_reviews/replyLog', icon: <History size={18} /> },
      { key: 'googleQA', href: '/section_reviews/googleQA', icon: <HelpCircle size={18} /> },     
      { key: 'reviewInvite', href: '/section_reviews/reviewInvite', icon: <QrCode size={18} /> },
      { key: 'reviewNotifier', href: '/section_reviews/reviewNotifier', icon: <BellRing size={16} /> },
    ]
  },
  {
    key: 'marketingTools',
    icon: <Megaphone size={20} />,
    items: [
      { key: 'postList', href: '/section_posts/postList', icon: <FileText size={18} /> },
      { key: 'postSingle', href: '/section_posts/postSingle', icon: <Edit size={18} /> },
      { key: 'schedulePost', href: '/section_posts/schedulePost', icon: <CalendarClock size={18} /> },
      { key: 'postBatch', href: '/section_posts/postBatch', icon: <ListOrdered size={18} /> },
      { key: 'aiPost', href: '/section_posts/aiPost', icon: <Sparkles size={18} /> },
    ]
  },
  {
    key: 'analytics',
    icon: <BarChart3 size={20} />,
    items: [
      { key: 'reviewAnalytics', href: '/section_analytics/reviewAnalytics', icon: <PieChart size={18} /> },
      { key: 'performance', href: '/section_analytics/performance', icon: <TrendingUp size={18} /> },
      { key: 'keyword', href: '/section_analytics/keyword', icon: <KeyRound size={18} /> },
      { key: 'locationRankings', href: '/section_analytics/locationRankings', icon: <Trophy size={18} /> },
      { key: 'competitor', href: '/section_analytics/competitor', icon: <BarChart2 size={18} /> },      
    ]
  },
  {
    key: 'localRanking',
    icon: <Trophy size={20} />,
    items: [
      { key: 'keywordSetting', href: '/section_ranking/keywordSetting', icon: <Settings size={18} /> },
      { key: 'localRank', href: '/section_ranking/localRank', icon: <TrendingUp size={18} /> },
    ]
  },
  {
    key: 'aiAdvisor',
    icon: <Brain size={20} />,
    items: [
      { key: 'storeSuggestion', href: '/section_aiAdvisor/storeSuggestion', icon: <Lightbulb size={18} /> },
      { key: 'localMarketing', href: '/section_aiAdvisor/localMarketing', icon: <Megaphone size={18} /> },
      { key: 'addressSuggestion', href: '/section_aiAdvisor/addressSuggestion', icon: <LocateFixed size={18} /> }
    ]
  }
]

// ========== Sidebar 本體 ==========
export default function Sidebar() {
  const t = useTranslations('Sidebar')
  const pathname = usePathname()
  const [openKeys, setOpenKeys] = useState([])
  const [topUsageKeys, setTopUsageKeys] = useState([])

  // 記錄常用
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
                <span className="icon">{group.icon}</span>
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
                        {item.icon}
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
      <div className="sidebar-bottom">
        <a href="/settings" className="sidebar-settings-icon">
          <Settings size={20} />
        </a>
      </div>
    </div>
  )
}
