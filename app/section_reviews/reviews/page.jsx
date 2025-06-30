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

// 日期工具
function getYesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}
function getNDaysAgoStr(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
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
function getThisYearRange() {
  const now = new Date();
  const start = `${now.getFullYear()}-01-01`;
  const end = getYesterdayStr();
  return [start, end];
}
function getThisMonthRange() {
  const now = new Date();
  const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const end = getYesterdayStr();
  return [start, end];
}
function getThisWeekRange() {
  const now = new Date();
  // 找本週一
  const day = now.getDay() || 7; // 星期天 day=0 → 7
  let monday = new Date(now);
  monday.setDate(now.getDate() - day + 1);
  let start = monday.toISOString().slice(0, 10);
  let end = getYesterdayStr();
  // 如果今天是週一，顯示上週一~上週日
  if (day === 1) {
    monday.setDate(monday.getDate() - 7);
    start = monday.toISOString().slice(0, 10);
    let sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    end = sunday.toISOString().slice(0, 10);
  }
  return [start, end];
}
function getYesterdayRange() {
  const y = getYesterdayStr();
  return [y, y];
}

export default function Page() {
  const { customerId, loading: customerLoading } = useCustomer();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);

  // 下拉選單用
  const [accountName, setAccountName] = useState("");
  const [locationName, setLocationName] = useState("");
  const [allAccountNames, setAllAccountNames] = useState([]);
  const [allLocationNames, setAllLocationNames] = useState([]);
  const [accountLocationsMap, setAccountLocationsMap] = useState({});

  // 地點搜尋用
  const [locationSearch, setLocationSearch] = useState("");

  // 日期區間
  const [startDate, setStartDate] = useState(getNDaysAgoStr(30));
  const [endDate, setEndDate] = useState(getYesterdayStr());
  const maxDate = getYesterdayStr();

  // 額外篩選: "all", "replied", "unreplied"
  const [replyFilter, setReplyFilter] = useState("all");

  // 摘要計數
  const [summary, setSummary] = useState({
    total: 0,
    replied: 0,
    unreplied: 0,
  });

  // 載入下拉選單 options
  useEffect(() => {
    if (!customerId) return;
    fetch(`/api/auth/reviews?all_names=1&customer_id=${customerId}`)
      .then(res => res.json())
      .then(data => {
        setAllAccountNames(data.all_account_names || []);
        setAllLocationNames(data.all_location_names || []);
        setAccountLocationsMap(data.account_locations_map || {});
      });
  }, [customerId]);

  // 查詢評論 (分頁)
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

  // 查詢 summary (全區間評論數量，搭配你的 summary API)
  useEffect(() => {
    if (!customerId || !startDate || !endDate) return;
    let url = `/api/auth/reviews/summary?customer_id=${customerId}&start=${startDate}&end=${endDate}`;
    if (accountName) url += `&account_name=${encodeURIComponent(accountName)}`;
    if (locationName) url += `&location_name=${encodeURIComponent(locationName)}`;
    fetch(url)
      .then(res => res.json())
      .then(data => setSummary(data || { total: 0, replied: 0, unreplied: 0 }))
      .catch(() => setSummary({ total: 0, replied: 0, unreplied: 0 }));
  }, [customerId, startDate, endDate, accountName, locationName]);

  // 動態地點 options，先依群組過濾，再依輸入搜尋
  let filteredLocationOptions = accountName
    ? (accountLocationsMap[accountName] || [])
    : allLocationNames;
  if (locationSearch) {
    const search = locationSearch.trim();
    filteredLocationOptions = filteredLocationOptions.filter(opt => opt.includes(search));
  }

  // 取得該地點所有群組（右側詳情用）
  function getAllGroupsOfLocation(locationName) {
    if (!locationName) return [];
    return Object.entries(accountLocationsMap)
      .filter(([account, locs]) => locs.includes(locationName))
      .map(([account]) => account);
  }

  // 根據 replyFilter 處理清單
  let filteredReviews = reviews;
  if (replyFilter === "replied") {
    filteredReviews = reviews.filter(r => !!r.replyComment && r.replyComment.trim());
  } else if (replyFilter === "unreplied") {
    filteredReviews = reviews.filter(r => !r.replyComment || !r.replyComment.trim());
  }

  // 點擊切換時，也要自動選擇第一筆
  useEffect(() => {
    if (filteredReviews.length === 0) {
      setSelectedReview(null);
    } else if (!filteredReviews.some(r => r.reviewId === selectedReview?.reviewId)) {
      setSelectedReview(filteredReviews[0]);
    }
    // eslint-disable-next-line
  }, [replyFilter, reviews]);

  return (
    <AuthenticatedLayout noContainer>
      <div className="reviews-container">
        {/* 左側側欄 */}
        <aside className="reviews-sidebar">
          <div className="reviews-sidebar-header">Reviews</div>
          <div className="reviews-sidebar-content">

            {/* 地區群組 */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 13, color: "#555", marginBottom: 2 }}>地區群組</label>
              <select
                value={accountName}
                onChange={e => {
                  setAccountName(e.target.value);
                  setLocationName(""); // 選群組時重設地點
                  setLocationSearch(""); // 清空地點搜尋
                }}
                style={{ width: "100%", fontSize: 13, border: "1px solid #d6d6d6", borderRadius: 4, padding: 3 }}
              >
                <option value="">全部群組</option>
                {allAccountNames.map(opt =>
                  <option key={opt} value={opt}>{opt}</option>
                )}
              </select>
            </div>

            {/* 地點名稱＋搜尋 */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 13, color: "#555", marginBottom: 2 }}>地點名稱</label>
              {/* 搜尋框 */}
              <input
                type="text"
                placeholder="搜尋地點名稱"
                value={locationSearch}
                onChange={e => setLocationSearch(e.target.value)}
                style={{
                  width: "100%",
                  fontSize: 12,
                  border: "1px solid #d6d6d6",
                  borderRadius: 4,
                  padding: 3,
                  marginBottom: 4
                }}
              />
              <select
                value={locationName}
                onChange={e => setLocationName(e.target.value)}
                style={{ width: "100%", fontSize: 13, border: "1px solid #d6d6d6", borderRadius: 4, padding: 3 }}
              >
                <option value="">全部地點</option>
                {filteredLocationOptions.map(opt =>
                  <option key={opt} value={opt}>{opt}</option>
                )}
              </select>
            </div>
            {/* 日期快速選擇按鈕 */}
            <div style={{ marginBottom: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button
                type="button"
                style={{ fontSize: 12, padding: "2px 7px", borderRadius: 4, border: "1px solid #ddd", background: "#f8f8fa", cursor: "pointer" }}
                onClick={() => { const [s, e] = getThisYearRange(); setStartDate(s); setEndDate(e); }}
              >今年</button>
              <button
                type="button"
                style={{ fontSize: 12, padding: "2px 7px", borderRadius: 4, border: "1px solid #ddd", background: "#f8f8fa", cursor: "pointer" }}
                onClick={() => { const [s, e] = getThisMonthRange(); setStartDate(s); setEndDate(e); }}
              >本月</button>
              <button
                type="button"
                style={{ fontSize: 12, padding: "2px 7px", borderRadius: 4, border: "1px solid #ddd", background: "#f8f8fa", cursor: "pointer" }}
                onClick={() => { const [s, e] = getThisWeekRange(); setStartDate(s); setEndDate(e); }}
              >本週</button>
              <button
                type="button"
                style={{ fontSize: 12, padding: "2px 7px", borderRadius: 4, border: "1px solid #ddd", background: "#f8f8fa", cursor: "pointer" }}
                onClick={() => { const [s, e] = getYesterdayRange(); setStartDate(s); setEndDate(e); }}
              >昨天</button>
            </div>
            {/* 日期區間 */}
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

            {/* 回覆狀態統計區（點選即可篩選） */}
            <ul className="reviews-folder-list">
              <li
                className={replyFilter === "all" ? "active" : ""}
                style={{ cursor: "pointer" }}
                onClick={() => setReplyFilter("all")}
              >評論數量 <span>{summary.total}</span></li>
              <li
                className={replyFilter === "replied" ? "active" : ""}
                style={{ cursor: "pointer" }}
                onClick={() => setReplyFilter("replied")}
              >已回覆 <span>{summary.replied}</span></li>
              <li
                className={replyFilter === "unreplied" ? "active" : ""}
                style={{ cursor: "pointer" }}
                onClick={() => setReplyFilter("unreplied")}
              >尚未回覆 <span>{summary.unreplied}</span></li>
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
            ) : filteredReviews.length === 0 ? (
              <div style={{ padding: 40, color: "#aaa", textAlign: "center" }}>目前查無評論</div>
            ) : (
              filteredReviews.map((r, i) => (
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
              {/* 所有群組與地點顯示 */}
              <div style={{
                margin: "6px 0 8px 0",
                fontSize: "0.98rem",
                color: "#333",
                background: "#f8f9fa",
                borderRadius: 5,
                padding: "7px 12px"
              }}>
                <div>
                  <span style={{ color: "#777" }}>地點名稱：</span>
                  <b>{selectedReview.location_name || "未知"}</b>
                </div>
                <div style={{ marginTop: 2 }}>
                  <span style={{ color: "#777" }}>地區群組：</span>
                  {getAllGroupsOfLocation(selectedReview.location_name).map((group, idx, arr) => (
                    <span
                      key={group}
                      style={{
                        fontWeight: group === selectedReview.account_name ? "bold" : "normal",
                        color: group === selectedReview.account_name ? "#2a6ebb" : "#888",
                        marginRight: 6
                      }}>
                      {group}{idx < arr.length - 1 ? "、" : ""}
                    </span>
                  ))}
                </div>
              </div>
              {/* 詳情區 */}
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
