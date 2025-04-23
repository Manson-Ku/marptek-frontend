'use client'

import { useTranslations } from 'next-intl'
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
} from 'lucide-react'

export default function Sidebar() {
  const t = useTranslations('Sidebar')

  const sections = [
    {
      titleKey: null, // 不顯示分區標題
      items: [{ key: 'summary', href: '#', icon: <Home size={18} /> }],
    },
    {
      titleKey: 'section_reviews',
      items: [
        { key: 'googleQA', href: '#', icon: <MessageSquare size={18} /> },
        { key: 'reviews', href: '#', icon: <Star size={18} /> },
        { key: 'autoResponse', href: '#', icon: <Bot size={18} /> },
        { key: 'reviewInvite', href: '#', icon: <MailPlus size={18} /> },
      ],
    },
    {
      titleKey: 'section_performance',
      items: [
        { key: 'performance', href: '#', icon: <BarChart3 size={18} /> },
        { key: 'keyword', href: '#', icon: <KeyRound size={18} /> },
      ],
    },
    {
      titleKey: 'section_posts',
      items: [
        { key: 'postList', href: '#', icon: <FileText size={18} /> },
        { key: 'postBatch', href: '#', icon: <ListOrdered size={18} /> },
        { key: 'postGenerator', href: '#', icon: <Sparkles size={18} /> },
      ],
    },
    {
      titleKey: 'section_locations',
      items: [
        { key: 'locationHealthCheck', href: '#', icon: <ShieldCheck size={18} /> },
        { key: 'basicInfoManagement', href: '#', icon: <Info size={18} /> },
        { key: 'propertyManagement', href: '#', icon: <Landmark size={18} /> },
        { key: 'linkManagement', href: '#', icon: <Link size={18} /> },
        { key: 'imageManagement', href: '#', icon: <Image size={18} /> },
      ],
    },
    {
      titleKey: 'section_competitors',
      items: [
        { key: 'competitorsLocal', href: '#', icon: <Radar size={18} /> },
        { key: 'competitorsRegion', href: '#', icon: <Globe2 size={18} /> },
      ],
    },
    {
      titleKey: 'section_ranking',
      items: [
        { key: 'localRank', href: '#', icon: <MapPin size={18} /> },
        { key: 'localSeo', href: '#', icon: <TrendingUp size={18} /> },
      ],
    },
  ]

  return (
    <div className="sidebar">
      {/* Logo 圖片 */}
      <div className="sidebar-logo mb-6">
        <img src="/logo-marptek.png" alt="MARPTEK" width="120" />
      </div>

      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="sidebar-section mb-4">
          {section.titleKey && (
            <div className="sidebar-section-title text-sm text-gray-400 mb-2">
              {t(section.titleKey)}
            </div>
          )}
          <nav className="sidebar-nav">
            {section.items.map((item, itemIndex) => (
              <a key={itemIndex} href={item.href} className="sidebar-link flex items-center gap-2">
                {item.icon}
                {t(item.key)}
              </a>
            ))}
          </nav>
        </div>
      ))}
    </div>
  )
}
