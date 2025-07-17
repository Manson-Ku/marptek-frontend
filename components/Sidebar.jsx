'use client'

import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import {
  Home, Store, MessageSquare, Star, Bot, QrCode, BellRing,
  BarChart3, KeyRound, FileText, ListOrdered, Sparkles, ShieldCheck, Info, Landmark, Link, Image, Trophy, MapPin, TrendingUp, Settings, Brain, Megaphone, LocateFixed
} from 'lucide-react'
import { useState, useEffect } from 'react'

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
        { key: 'storeSuggestion', href: '/section_aiAdvisor/storeSuggestion', icon: <BarChart3 size={18} /> },
        { key: 'localMarketing', href: '/section_aiAdvisor/localMarketing', icon: <Megaphone size={18} /> },
        { key: 'addresSuggestion', href: '/section_aiAdvisor/addresSuggestion', icon: <LocateFixed size={18} /> }
      ]
    }
  ]

  const allItemsFlat = groups.flatMap(g => g.items)
  const topUsageItems = allItemsFlat.filter(item => topUsageKeys.includes(item.key) && item.key !== 'summary')

  useEffect(() => {
    setTopUsageKeys(getTopUsages(5))
  }, [pathname])

  // 自動展開有 active 的 group
  useEffect(() => {
    for (let group of groups) {
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
        {groups.map(group => {
          // only for overview group, handle special insert for 常用鏈結
          let groupItems = group.items
          if (group.key === 'overview' && openKeys.includes('overview') && topUsageItems.length > 0) {
            // summary + divider + 常用
            const result = [group.items[0]]
            result.push({ key: '__divider__' })
            for (const item of topUsageItems) result.push(item)
            groupItems = result
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
                <span>{group.label}</span>
                <span className="arrow">{openKeys.includes(group.key) ? '▲' : '▼'}</span>
              </button>
              {openKeys.includes(group.key) && groupItems.length > 0 && (
                <nav id={`sidebar-group-${group.key}`}>
                  {groupItems.map((item, idx) =>
                    item.key === '__divider__' ? (
                      <div key="divider" style={{ borderBottom: '1px solid #e5e7eb', margin: '8px 0 2px 0', opacity: 0.7 }}>
                        <div
                          className="sidebar-section-title"
                          style={{ marginTop: 2, marginBottom: 4, fontWeight: 400, color: '#888', fontSize: '0.82rem' }}
                        >
                          --- 常用鏈結 ---
                        </div>
                      </div>
                    ) : (
                      <a
                        key={item.key}
                        href={item.href}
                        className={pathname === item.href ? 'active' : ''}
                        onClick={() => handleSidebarClick(item)}
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
