"use client";
import { useEffect, useState } from "react";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import { useCustomer } from "@/context/CustomerContext";
import "./reviews.css";

// 星等字串轉數字
function getStarNum(starRating) {
  switch (starRating) {
    case "FIVE": return 5;
    case "FOUR": return 4;
    case "THREE": return 3;
    case "TWO": return 2;
    case "ONE": return 1;
    default: return 0;
  }
}
function getTodayStr() { return new Date().toISOString().slice(0, 10); }
function getYesterdayStr() { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10); }
function getNDaysAgoStr(n) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); }
function formatDate(ts) {
  if (!ts) return "--";
  if (typeof ts === "object") {
    if (ts.value) ts = ts.value;
    else if (ts instanceof Date) ts = ts.toISOString();
    else return "--";
  }
  if (typeof ts === "string") return ts.split("T")[0];
  return "--";
}

export default function Page() {
  const { customerId, loading: customerLoading } = useCustomer();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);

  // 查詢條件
  const [startDate, setStartDate] = useState(getNDaysAgoStr(30));
  const [endDate, setEndDate] = useState(getYesterdayStr());
  const maxDate = getYesterdayStr();
  const [accountName, setAccountName] = useState("");
  const [locationName, setLocationName] = useState("");

  // 可選擇的群組/地點
  const [accountNames, setAccountNames] = useState([]);
  const [locationNames, setLocationNames] = useState([]);
  const [accountLocationsMap, setAccountLocationsMap] = useState({}); // 交互用

  // 1. 載入可用 account/location（只查一次）
  useEffect(() => {
    if (!customerId) return;
    fetch(`/api/auth/reviews?customer_id=${customerId}&all_names=1`)
      .then(res => res.json())
      .then(data => {
        setAccountNames([...new Set((data.all_account_names || []).filter(Boolean))]);
        setLocationNames([...new Set((data.all_location_names || []).filter(Boolean))]);

        // 若有提供交互 map（最佳），優先用，不然自己組
        if (data.account_locations_map) {
          setAccountLocationsMap(data.account_locations_map);
        } else if (data.account_location_pairs) {
          // 後端回傳 account-location 對應
          const map = {};
          data.account_location_pairs.forEach(([a, l]) => {
            if (!map[a]) map[a] = [];
            map[a].push(l);
          });
          setAccountLocationsMap(map);
        } else if (data.account_location_full) {
          // 備用結構
          setAccountLocationsMap(data.account_location_full);
        }
      });
  }, [customerId]);

  // 2. 查詢評論（任何一個查詢條件變動都重查）
  useEffect(() => {
    if (!customerId || !startDate || !endDate) return;
    setLoading(true);
    let url = `/api/auth/reviews?customer_id=${customerId}&start=${startDate}&end=${endDate}`;
    if (accountName) url += `&account_name=${encodeURIComponent(accountName)}`;
    if (locationName) url += `&location_name=${encodeURIComponent(locationName)}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setReviews(data.reviews || []);
        setLoading(false);
        setSelectedReview((data.reviews && data.reviews[0]) || null);
      })
      .catch(() => setLoading(false));
  }, [customerId, startDate, endDate, accountName, locationName]);

  // 3. 地區群組變動時，自動重設地點名稱
  useEffect(() => {
    setLocationName(""); // 每次切換群組自動 reset 地點
  }, [accountName]);

  // 4. 根據目前選到的 accountName，決定顯示哪些地點
  const filteredLocationNames = accountName
    ? (accountLocationsMap[accountName] || [])
    : locationNames;

  return (
    <AuthenticatedLayout noContainer>
      <div className="reviews-container">
        {/* 左側側欄 */}
        <aside className="reviews-sidebar">
          <div className="reviews-sidebar-header">Reviews</div>
          <div className="reviews-sidebar-content">
            {/* 新增兩個下拉篩選 */}
            <div style={{ width: "100%", marginBottom: 12 }}>
              <label style={{ fontSize: 13, color: "#555", marginBottom: 2, display: "block" }}>地區群組</label>
              <select
                value={accountName}
                onChange={e => setAccountName(e.target.value)}
                style={{ width: "100%", fontSize: 13, padding: 4, borderRadius: 4, marginBottom: 6 }}
              >
                <option value="">全部群組</option>
                {accountNames.map(name =>
                  <option key={name} value={name}>{name}</option>
                )}
              </select>
              <label style={{ fontSize: 13, color: "#555", marginBottom: 2, display: "block" }}>地點名稱</label>
              <select
                value={locationName}
                onChange={e => setLocationName(e.target.value)}
                style={{ width: "100%", fontSize: 13, padding: 4, borderRadius: 4 }}
                disabled={accountName && filteredLocationNames.length === 0}
              >
                <option value="">全部地點</option>
                {filteredLocationNames.map(l =>
                  <option key={l} value={l}>{l}</option>
                )}
              </select>
            </div>
            <div className="reviews-date-range" style={{ flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
              <label style={{ fontSize: 13, color: "#555", marginBottom: 3 }}>評論查詢區間：</label>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <input
                  type="date"
                  value={startDate}
                  max={endDate}
                  onChange={e => setStartDate(e.target.value)}
                  style={{ fontSize: 13, border: "1px solid #d6d6d6", borderRadius: 4, padding: 3, width: 110 }}
                />
                <span style={{ margin: "0 2px" }}>~</span>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  max={maxDate}
                  onChange={e => setEndDate(e.target.value)}
                  style={{ fontSize: 13, border: "1px solid #d6d6d6", borderRadius: 4, padding: 3, width: 110 }}
                />
              </div>
              <div style={{ fontSize: 12, color: "#b2b2b2", marginTop: 3 }}>
                （結束日「不含當天」，最大只能到昨天）
              </div>
            </div>
            <ul className="reviews-folder-list">
              <li className="active">All Reviews <span>{reviews.length}</span></li>
              <li>Open <span>--</span></li>
              <li>Replied <span>--</span></li>
            </ul>
          </div>
          <div className="reviews-sidebar-footer">
            <button className="reviews-add-template">+ 新增回覆範本</button>
          </div>
        </aside>

        {/* 中間評論清單 */}
        <main className="reviews-list">
          <div className="reviews-list-header">
            <span>評論清單</span>
            <div>
              <input className="reviews-search" placeholder="搜尋評論…" />
              <button className="reviews-btn">篩選</button>
              <button className="reviews-btn">排序</button>
            </div>
          </div>
          <div className="reviews-list-content">
            {customerLoading || loading ? (
              <div style={{ padding: 40, color: "#888", textAlign: "center" }}>載入中…</div>
            ) : reviews.length === 0 ? (
              <div style={{ padding: 40, color: "#aaa", textAlign: "center" }}>目前查無評論</div>
            ) : (
              reviews.map((r, i) => (
                <div
                  key={r.reviewId || i}
                  className={`reviews-list-item${selectedReview?.reviewId === r.reviewId ? ' active' : ''}`}
                  onClick={() => setSelectedReview(r)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="reviews-avatar"
                    style={{
                      backgroundImage: r.profilePhotoUrl ? `url(${r.profilePhotoUrl})` : undefined,
                      backgroundSize: "cover"
                    }}
                  ></div>
                  <div className="reviews-item-content">
                    <div className="reviews-author">
                      {r.displayName || "匿名"}
                      <span style={{ marginLeft: 8, color: "#faad14" }}>
                        {"★".repeat(getStarNum(r.starRating))}
                      </span>
                    </div>
                    <div className="reviews-snippet">
                      {r.comment?.slice(0, 40) || "（無內容）"}
                    </div>
                    <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                      {r.account_name && `[${r.account_name}]`} {r.location_name}
                    </div>
                  </div>
                  <div className="reviews-date">
                    {formatDate(r.createTime_ts)}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>

        {/* 右側詳情 */}
        <section className="reviews-detail">
          {selectedReview ? (
            <>
              <div className="reviews-detail-header">
                <div className="reviews-detail-title">
                  {selectedReview.displayName || "匿名"}
                  <span style={{ marginLeft: 12, color: "#faad14" }}>
                    {"★".repeat(getStarNum(selectedReview.starRating))}
                  </span>
                  <span style={{ color: "#b7b7b7", marginLeft: 16, fontSize: "0.98rem" }}>
                    {formatDate(selectedReview.createTime_ts)}
                  </span>
                </div>
                <div style={{ margin: "6px 0", color: "#888", fontSize: 14 }}>
                  {selectedReview.account_name && `[${selectedReview.account_name}]`} {selectedReview.location_name}
                </div>
                <div className="reviews-detail-text" style={{ margin: "12px 0 0 0" }}>
                  {selectedReview.comment || <span style={{ color: "#bbb" }}>（無評論內容）</span>}
                </div>
              </div>
              <div className="reviews-detail-reply">
                <div style={{ color: "#666", fontSize: "0.96rem", marginBottom: 6 }}>
                  回覆內容
                </div>
                <textarea
                  className="reviews-reply-input"
                  placeholder="輸入你的回覆內容…"
                  defaultValue={selectedReview.replyComment || ""}
                />
                <div className="reviews-detail-actions">
                  <button className="reviews-reply-btn">送出回覆</button>
                </div>
                {selectedReview.replyComment && (
                  <div style={{ color: "#46a", fontSize: "0.93rem", marginTop: 16 }}>
                    上次回覆：{selectedReview.replyComment}
                    {selectedReview.replyUpdateTime &&
                      <span style={{ marginLeft: 10, color: "#b7b7b7" }}>
                        {formatDate(selectedReview.replyUpdateTime)}
                      </span>}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ padding: 36, color: "#aaa" }}>請從左側清單選擇一則評論</div>
          )}
        </section>
      </div>
    </AuthenticatedLayout>
  );
}
