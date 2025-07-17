'use client'

import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import {
  Home, Store, MessageSquare, Star, Bot, QrCode, BellRing,
  BarChart3, KeyRound, FileText, ListOrdered, Sparkles, ShieldCheck, Info, Landmark, Link, Image, Trophy, MapPin, TrendingUp, Settings, Brain,Megaphone,LocateFixed
} from 'lucide-react'
import { useState, useEffect } from 'react'

// 紀錄點擊次數
function recordSidebarUsage(key) {
  if (typeof window === 'undefined') return
  const stats = JSON.parse(localStorage.getItem('sidebarUsage') || '{}')
  stats[key] = (stats[key] || 0) + 1
  localStorage.setItem('sidebarUsage', JSON.stringify(stats))
}

// 取得點擊最多的前 n 個 key
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
  const [openKey, setOpenKey] = useState(null)
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
        { key: 'storeSuggestion', href: '/section_aiAdvisor/storeSuggestion', icon: <BarChart3 size={18} /> },   // 營運建議
        { key: 'localMarketing', href: '/section_aiAdvisor/localMarketing', icon: <Megaphone size={18} /> },     // 在地行銷
        { key: 'addresSuggestion', href: '/section_aiAdvisor/addresSuggestion', icon: <LocateFixed size={18} /> } // 選址
      ]
    }
  ]

  // 所有子項展平成一維
  const allItemsFlat = groups.flatMap(g => g.items)

  // 當前常用 key 對應到完整 item 資料
  const topUsageItems = allItemsFlat
    .filter(item => topUsageKeys.includes(item.key) && item.key !== 'summary') // 排除 summary

  // 每次路徑變動都刷新常用排行
  useEffect(() => {
    setTopUsageKeys(getTopUsages(5))
  }, [pathname])

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

  // 點擊記錄
  function handleSidebarClick(item) {
    recordSidebarUsage(item.key)
  }

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
            {/* 總覽分組插入常用鏈結 */}
            {group.key === 'overview' && topUsageItems.length > 0 && (
              <>
                <div style={{ borderBottom: '1px solid #e5e7eb', margin: '8px 0 2px 0', opacity: 0.7 }} />
                <div className="sidebar-section-title" style={{ marginTop: 2, marginBottom: 4, fontWeight: 400, color: '#888', fontSize: '0.82rem' }}>
                  --- 常用鏈結 ---
                </div>
                <nav>
                  {topUsageItems.map(item => (
                    <a
                      key={item.key}
                      href={item.href}
                      className={pathname === item.href ? 'active' : ''}
                      onClick={() => handleSidebarClick(item)}
                    >
                      {item.icon}
                      <span>{t(item.key)}</span>
                    </a>
                  ))}
                </nav>
              </>
            )}
            {openKey === group.key && group.items.length > 0 && (
              <nav id={`sidebar-group-${group.key}`}>
                {group.items.map(item => (
                  <a
                    key={item.key}
                    href={item.href}
                    className={pathname === item.href ? 'active' : ''}
                    onClick={() => handleSidebarClick(item)}
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
