'use client'

import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import {
  Home,
  MessageSquare,
  Star,
  Bot,
  MailPlus,
  BarChart3,
  KeyRound,
  FileText,
  ListOrdered,
  Sparkles,
  ShieldCheck,
  Info,
  Landmark,
  Link,
  Image,
  Radar,
  Globe2,
  MapPin,
  TrendingUp,
  BellRing,
  Settings
} from 'lucide-react'

export default function Sidebar() {
  const t = useTranslations('Sidebar')
  const pathname = usePathname()

  const sections = [
    {
      titleKey: null,
      items: [{ key: 'summary', href: '/', icon: <Home size={18} /> }],
    },
    {
      titleKey: 'section_reviews',
      items: [
        { key: 'googleQA', href: '/section_reviews/googleQA', icon: <MessageSquare size={18} /> },
        { key: 'reviews', href: '/section_reviews/reviews', icon: <Star size={18} /> },
        { key: 'autoResponse', href: '/section_reviews/autoResponse', icon: <Bot size={18} /> },
        { key: 'reviewInvite', href: '/section_reviews/reviewInvite', icon: <MailPlus size={18} /> },
        { key: 'reviewNotifier', href: '/section_reviews/reviewNotifier', icon: <BellRing size={16} /> },
      ],
    },
    {
      titleKey: 'section_performance',
      items: [
        { key: 'performance', href: '/section_performance/performance', icon: <BarChart3 size={18} /> },
        { key: 'keyword', href: '/section_performance/keyword', icon: <KeyRound size={18} /> },
      ],
    },
    {
      titleKey: 'section_posts',
      items: [
        { key: 'postList', href: '/section_posts/postList', icon: <FileText size={18} /> },
        { key: 'postBatch', href: '/section_posts/postBatch', icon: <ListOrdered size={18} /> },
        { key: 'postGenerator', href: '/section_posts/postGenerator', icon: <Sparkles size={18} /> },
      ],
    },
    {
      titleKey: 'section_locations',
      items: [
        { key: 'locationHealthCheck', href: '/section_locations/locationHealthCheck', icon: <ShieldCheck size={18} /> },
        { key: 'basicInfoManagement', href: '/section_locations/basicInfoManagement', icon: <Info size={18} /> },
        { key: 'propertyManagement', href: '/section_locations/propertyManagement', icon: <Landmark size={18} /> },
        { key: 'linkManagement', href: '/section_locations/linkManagement', icon: <Link size={18} /> },
        { key: 'imageManagement', href: '/section_locations/imageManagement', icon: <Image size={18} /> },
      ],
    },
    {
      titleKey: 'section_competitors',
      items: [
        { key: 'competitorsLocal', href: '/section_competitors/competitorsLocal', icon: <Radar size={18} /> },
        { key: 'competitorsRegion', href: '/section_competitors/competitorsRegion', icon: <Globe2 size={18} /> },
      ],
    },
    {
      titleKey: 'section_ranking',
      items: [
        { key: 'localRank', href: '/section_ranking/localRank', icon: <MapPin size={18} /> },
        { key: 'localSeo', href: '/section_ranking/localSeo', icon: <TrendingUp size={18} /> },
      ],
    },
  ]

  return (
    <div className="sidebar">
      {/* 🟦 區塊 1：Logo */}
      <div className="sidebar-top">
        <img src="/logo-marptek.png" alt="MARPTEK" width="120" />
      </div>

      {/* 🟩 區塊 2：主要功能選單 */}
      <div className="sidebar-middle">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="sidebar-section mb-4">
            {section.titleKey && (
              <div className="sidebar-section-title">
                {t(section.titleKey)}
              </div>
            )}
            <nav className="sidebar-nav">
              {section.items.map((item, itemIndex) => {
                const isActive = pathname.startsWith(item.href)
                return (
                  <a
                    key={itemIndex}
                    href={item.href}
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    {item.icon}
                    {t(item.key)}
                  </a>
                )
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* 🟥 區塊 3：設定按鈕 */}
      <div className="sidebar-bottom">
        <a
          href="/settings"
          className={`sidebar-link sidebar-settings-icon ${pathname.startsWith('/settings') ? 'active' : ''}`}
        >
          <Settings size={18} />
        </a>
      </div>
    </div>
  )
}
