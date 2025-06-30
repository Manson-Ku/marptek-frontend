'use client'
import React, { useEffect, useState } from "react";
import './page.css';

export default function LocationHealthCheck() {
  const [locations, setLocations] = useState([]);
  const [groupOptions, setGroupOptions] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: 取得 customer_id，這裡要根據你的登入狀態/Context 帶入
    const customer_id = 'YOUR_CUSTOMER_ID';
    fetch(`/api/auth/locations?customer_id=${customer_id}`)
      .then(res => res.json())
      .then(data => {
        setLocations(data.locations || []);
        const accountIDs = [...new Set(data.locations.map(loc => loc.accountID))];
        setGroupOptions(accountIDs);
        setLoading(false);
      });
  }, []);

  function checkNAP(loc) {
    let score = 0, max = 3;
    if (loc.title) score++;
    if (loc.storefrontAddress?.addressLines?.length) score++;
    if (loc.phoneNumbers?.primaryPhone) score++;
    return Math.round((score / max) * 100);
  }

  const filtered = selectedGroup
    ? locations.filter(loc => loc.accountID === selectedGroup)
    : locations;

  return (
    <div className="lhc-root">
      <h2 className="lhc-title">地點健檢清單</h2>

      <div className="lhc-toolbar">
        <label htmlFor="groupFilter">地區群組：</label>
        <select id="groupFilter" value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}>
          <option value="">全部</option>
          {groupOptions.map(id => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>
      </div>

      <table className="lhc-table">
        <thead>
          <tr>
            <th>勾選</th>
            <th>店名</th>
            <th>NAP 健檢</th>
            <th>地址</th>
            <th>電話</th>
            <th>主類別</th>
            <th>狀態</th>
            <th>地圖</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(loc => (
            <tr key={loc.name}>
              <td><input type="checkbox" /></td>
              <td>{loc.title || <span className="lhc-warn">缺少</span>}</td>
              <td><NAPBar score={checkNAP(loc)} /></td>
              <td>{loc.storefrontAddress?.addressLines?.join(' ') || <span className="lhc-warn">缺少</span>}</td>
              <td>{loc.phoneNumbers?.primaryPhone || <span className="lhc-warn">缺少</span>}</td>
              <td>{loc.categories?.primaryCategory?.displayName || <span className="lhc-warn">缺少</span>}</td>
              <td>{loc.is_active ? '啟用' : <span className="lhc-warn">停用</span>}</td>
              <td>
                {loc.metadata?.mapsUri && (
                  <a href={loc.metadata.mapsUri} target="_blank" rel="noopener noreferrer">地圖</a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {loading && <div className="lhc-loading">載入中...</div>}
    </div>
  );
}

function NAPBar({ score }) {
  let color = score === 100 ? '#37c736' : score >= 66 ? '#f6b625' : '#ec4848';
  return (
    <div className="lhc-nap-bar">
      <div
        className="lhc-nap-bar-inner"
        style={{
          width: `${score}%`,
          background: color
        }}
      >{score}%</div>
    </div>
  );
}
