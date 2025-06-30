"use client";
import { useEffect, useState } from "react";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import { useCustomer } from "@/context/CustomerContext";
import "./locationHealthCheck.css";

// 日期格式化工具
function formatDate(ts) {
  if (!ts) return "--";
  if (typeof ts === "string") return ts.split("T")[0];
  if (typeof ts === "object" && ts.value) return String(ts.value).split("T")[0];
  if (ts instanceof Date) return ts.toISOString().split("T")[0];
  return "--";
}

// 地址驗證
function isAddressValid(addr) {
  if (!addr) return false;
  return !!(
    addr.administrativeArea &&
    addr.locality &&
    Array.isArray(addr.addressLines) &&
    addr.addressLines[0]
  );
}

// NAP分數
function calcNAPScore(loc) {
  let score = 0;
  if (loc.title) score++;
  if (isAddressValid(loc.storefrontAddress)) score++;
  if (loc.phoneNumbers?.primaryPhone) score++;
  return Math.round((score / 3) * 100);
}

// NAP缺漏
function formatNAPHint(loc) {
  const lacks = [];
  if (!loc.title) lacks.push("名稱");
  if (!isAddressValid(loc.storefrontAddress)) lacks.push("地址");
  if (!loc.phoneNumbers?.primaryPhone) lacks.push("電話");
  return lacks.length === 0 ? "✅ 完整" : "缺少：" + lacks.join("、");
}

// 地址組字串
function renderAddress(addr) {
  if (!isAddressValid(addr)) return <span className="lhc-warn">（缺完整地址）</span>;
  return `${addr.administrativeArea || ""}${addr.locality || ""}${addr.addressLines[0] || ""}`;
}

export default function LocationHealthCheckPage() {
  const { customerId, loading: customerLoading } = useCustomer();
  const [locations, setLocations] = useState([]);
  const [selectedLoc, setSelectedLoc] = useState(null);

  // 篩選器
  const [accountId, setAccountId] = useState("");
  const [allAccountIds, setAllAccountIds] = useState([]);
  const [locationSearch, setLocationSearch] = useState("");
  const [filteredLocs, setFilteredLocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customerId) return;
    setLoading(true);
    fetch(`/api/auth/locations?customer_id=${customerId}`)
      .then(res => res.json())
      .then(data => {
        const locs = data.locations || [];
        setLocations(locs);
        setAllAccountIds([...new Set(locs.map(l => l.accountID))]);
        setFilteredLocs(locs);
        setLoading(false);
      });
  }, [customerId]);

  // 依據篩選條件過濾
  useEffect(() => {
    let list = locations;
    if (accountId) list = list.filter(l => l.accountID === accountId);
    if (locationSearch) list = list.filter(l => (l.title || "").includes(locationSearch));
    setFilteredLocs(list);
    // 自動選第一筆
    setSelectedLoc(list[0] || null);
  }, [locations, accountId, locationSearch]);

  return (
    <AuthenticatedLayout noContainer>
      <div className="lhc-container">
        {/* 左側篩選器 */}
        <aside className="lhc-sidebar">
          <div className="lhc-sidebar-header">地點健檢</div>
          <div className="lhc-sidebar-content">
            <div>
              <label>地區群組</label>
              <select value={accountId} onChange={e => setAccountId(e.target.value)}>
                <option value="">全部群組</option>
                {allAccountIds.map(opt =>
                  <option key={opt} value={opt}>{opt}</option>
                )}
              </select>
            </div>
            <div style={{ marginTop: 10 }}>
              <label>地點名稱</label>
              <input
                type="text"
                placeholder="搜尋店名"
                value={locationSearch}
                onChange={e => setLocationSearch(e.target.value)}
              />
            </div>
            {/* 健檢統計 */}
            <div className="lhc-stats" style={{ marginTop: 18 }}>
              <div>總數：{filteredLocs.length}</div>
              <div>
                完整NAP：{filteredLocs.filter(l => calcNAPScore(l) === 100).length}
                {" / "}
                {filteredLocs.length}
              </div>
            </div>
          </div>
        </aside>
        {/* 中間地點列表 */}
        <main className="lhc-list">
          <div className="lhc-list-header">地點清單</div>
          <div className="lhc-list-content">
            {customerLoading || loading ? (
              <div style={{ padding: 40, color: "#888", textAlign: "center" }}>載入中…</div>
            ) : filteredLocs.length === 0 ? (
              <div style={{ padding: 40, color: "#aaa", textAlign: "center" }}>目前查無地點</div>
            ) : (
              filteredLocs.map(loc => (
                <div
                  key={loc.name}
                  className={`lhc-list-item${selectedLoc?.name === loc.name ? ' active' : ''}`}
                  onClick={() => setSelectedLoc(loc)}
                >
                  <div className="lhc-item-title">{loc.title || <span className="lhc-warn">（缺店名）</span>}</div>
                  <div className="lhc-item-nap">
                    <NAPBar score={calcNAPScore(loc)} />
                  </div>
                  <div className="lhc-item-detail">
                    {renderAddress(loc.storefrontAddress)}
                  </div>
                  <div className="lhc-item-detail">
                    {loc.phoneNumbers?.primaryPhone || <span className="lhc-warn">（缺電話）</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
        {/* 右側詳情 */}
        <section className="lhc-detail">
          {selectedLoc ? (
            <>
              <div style={{
                background: "#f8f9fa",
                borderRadius: 5,
                padding: "7px 12px",
                margin: "6px 0 10px 0",
                color: "#333"
              }}>
                <div>地點名稱：<b>{selectedLoc.title || "未設定"}</b></div>
                <div>地區群組：<span style={{ color: "#2a6ebb" }}>{selectedLoc.accountID}</span></div>
              </div>
              <div className="lhc-detail-nap-title">
                NAP 健檢分數
                <span style={{ marginLeft: 8 }}>
                  <NAPBar score={calcNAPScore(selectedLoc)} />
                </span>
              </div>
              <div className="lhc-detail-hint" style={{ margin: "12px 0 0 0", color: "#666" }}>
                {formatNAPHint(selectedLoc)}
              </div>
              <div style={{ marginTop: 14 }}>
                <div>地址：{renderAddress(selectedLoc.storefrontAddress)}</div>
                <div>電話：{selectedLoc.phoneNumbers?.primaryPhone || <span className="lhc-warn">（缺電話）</span>}</div>
                <div>主類別：{selectedLoc.categories?.primaryCategory?.displayName || <span className="lhc-warn">（缺主類別）</span>}</div>
                <div>營運狀態：{selectedLoc.is_active ? '啟用' : '停用'} / {selectedLoc.openInfo?.status || "未知"}</div>
                <div>地圖連結：
                  {selectedLoc.metadata?.mapsUri
                    ? <a href={selectedLoc.metadata.mapsUri} target="_blank" rel="noopener noreferrer">Google Maps</a>
                    : <span className="lhc-warn">（缺連結）</span>}
                </div>
                <div>最後同步：{formatDate(selectedLoc.upd_datetime)}</div>
              </div>
            </>
          ) : (
            <div style={{ padding: 36, color: "#aaa" }}>請從中間清單選擇一個地點</div>
          )}
        </section>
      </div>
    </AuthenticatedLayout>
  );
}

// NAP健檢條
function NAPBar({ score }) {
  let color = score === 100 ? '#1ac944' : score >= 66 ? '#f6b625' : '#ec4848';
  return (
    <div className="lhc-nap-bar">
      <div className="lhc-nap-bar-inner" style={{ width: `${score}%`, background: color }}>
        {score}%
      </div>
    </div>
  );
}
