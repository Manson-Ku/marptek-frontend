"use client";
import { useEffect, useState, useRef } from "react";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import { useCustomer } from "@/context/CustomerContext";
import "./reviews.css";

const DEFAULT_LIMIT = 50;

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
  const day = now.getDay() || 7;
  let monday = new Date(now);
  monday.setDate(now.getDate() - day + 1);
  let start = monday.toISOString().slice(0, 10);
  let end = getYesterdayStr();
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

  //回覆評論用
  const replyInputRef = useRef();
  // 日期區間
  const [startDate, setStartDate] = useState(getNDaysAgoStr(30));
  const [endDate, setEndDate] = useState(getYesterdayStr());
  const maxDate = getYesterdayStr();

  // 篩選
  const [replyFilter, setReplyFilter] = useState("all");

  // 統計
  const [summary, setSummary] = useState({ total: 0, replied: 0, unreplied: 0 });

  // 分頁
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);

  // 條件 key
  const lastQueryKey = useRef("");

  // 取得下拉
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

  // 條件有變，重置分頁
  function getQueryKey() {
    return [
      customerId, startDate, endDate, accountName, locationName, replyFilter
    ].join("|");
  }
  useEffect(() => {
    const thisKey = getQueryKey();
    if (lastQueryKey.current !== thisKey) {
      lastQueryKey.current = thisKey;
      setOffset(0);
      setReviews([]);
      setHasMore(true);
    }
  }, [customerId, startDate, endDate, accountName, locationName, replyFilter]);

  // 查詢 reviews（offset 變化時自動拉）
  useEffect(() => {
    if (!customerId || !startDate || !endDate || !hasMore) return;
    setLoading(offset === 0);
    setPageLoading(offset > 0);
    let url = `/api/auth/reviews?customer_id=${customerId}&start=${startDate}&end=${endDate}&limit=${DEFAULT_LIMIT}&offset=${offset}`;
    if (accountName) url += `&account_name=${encodeURIComponent(accountName)}`;
    if (locationName) url += `&location_name=${encodeURIComponent(locationName)}`;
    if (replyFilter && replyFilter !== "all") url += `&reply_filter=${replyFilter}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        const fetched = data.reviews || [];
        setReviews(prev => offset === 0 ? fetched : [...prev, ...fetched]);
        setHasMore(fetched.length === DEFAULT_LIMIT);
        setLoading(false);
        setPageLoading(false);
        if ((offset === 0 && fetched.length > 0) || !selectedReview) {
          setSelectedReview(fetched[0] || null);
        }
      })
      .catch(() => {
        setLoading(false);
        setPageLoading(false);
        if (offset === 0) setReviews([]);
      });
    // eslint-disable-next-line
  }, [customerId, startDate, endDate, accountName, locationName, replyFilter, offset]);

  // summary API 不用帶 replyFilter
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

  // 地點 options
  let filteredLocationOptions = accountName
    ? (accountLocationsMap[accountName] || [])
    : allLocationNames;
  if (locationSearch) {
    const search = locationSearch.trim();
    filteredLocationOptions = filteredLocationOptions.filter(opt => opt.includes(search));
  }

  // 所有群組
  function getAllGroupsOfLocation(locationName) {
    if (!locationName) return [];
    return Object.entries(accountLocationsMap)
      .filter(([account, locs]) => locs.includes(locationName))
      .map(([account]) => account);
  }

  // 點擊切換篩選，重設 offset
  function handleSetReplyFilter(val) {
    setReplyFilter(val);
    setOffset(0);
  }

  // 清單區直接用 reviews
  useEffect(() => {
    if (reviews.length === 0) setSelectedReview(null);
    else if (!reviews.some(r => r.reviewId === selectedReview?.reviewId)) setSelectedReview(reviews[0]);
    // eslint-disable-next-line
  }, [reviews]);

  // 回覆評論用
  async function handleReplySubmit() {
    if (!selectedReview) return;
    const replyComment = replyInputRef.current.value?.trim();
    if (!replyComment) {
      alert("請輸入回覆內容");
      return;
    }
    if (!customerId) {
      alert("缺少 customerId，請重新登入");
      return;
    }
    // 判斷是否要覆蓋
    if (selectedReview.replyComment && selectedReview.replyComment.trim() !== "") {
      const ok = window.confirm(
        `此評論已經有回覆：\n\n${selectedReview.replyComment}\n\n確定要覆蓋嗎？`
      );
      if (!ok) return;
    } else {
      const ok = window.confirm(`確定要送出回覆嗎？`);
      if (!ok) return;
    }

    // 組合 payload
    const body = {
      reviewId: selectedReview.reviewId,
      customer_id: customerId,
      replyComment,
      accountId: selectedReview.accountId,
      locationId: selectedReview.locationId,
      reply_by: "系統管理員", // 可以用 session user name
    };

    try {
      const resp = await fetch("https://reply-reviews-84949832003.asia-east1.run.app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      if (data.status === 200) {
        alert("回覆成功！");
        setSelectedReview(prev => ({
          ...prev,
          replyComment: replyComment,
          replyUpdateTime: new Date().toISOString()
        }));
        setReviews(old =>
          old.map(r =>
            r.reviewId === selectedReview.reviewId
              ? { ...r, replyComment: replyComment, replyUpdateTime: new Date().toISOString() }
              : r
          )
        );
      } else {
        alert("回覆失敗: " + (data.response?.error || data.response?.message || "未知錯誤"));
      }
    } catch (err) {
      alert("送出失敗: " + err.message);
    }
  }
  // 刪除回覆（新版，呼叫 DELETE，payload 放 body）
  async function handleDeleteReply() {
    if (!selectedReview) return;
    if (!selectedReview.replyComment || selectedReview.replyComment.trim() === "") return;
    const ok = window.confirm(
      "⚠️ 你確定要刪除這則回覆嗎？（刪除後使用者將看不到原本的回覆內容，且可以再次編輯與送出）"
    );
    if (!ok) return;

    if (!customerId) {
      alert("缺少 customerId，請重新登入");
      return;
    }

    const body = {
      reviewId: selectedReview.reviewId,
      customer_id: customerId,
      accountId: selectedReview.accountId,
      locationId: selectedReview.locationId,
      reply_by: "系統管理員",
    };

    try {
      const resp = await fetch("https://reply-reviews-84949832003.asia-east1.run.app", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      if (data.status === 200) {
        alert("已刪除回覆！");
        setSelectedReview(prev => ({
          ...prev,
          replyComment: "",
          replyUpdateTime: new Date().toISOString()
        }));
        setReviews(old =>
          old.map(r =>
            r.reviewId === selectedReview.reviewId
              ? { ...r, replyComment: "", replyUpdateTime: new Date().toISOString() }
              : r
          )
        );
        // 清除 textarea
        if (replyInputRef.current) replyInputRef.current.value = "";
      } else {
        alert("刪除失敗: " + (data.response?.error || data.response?.message || "未知錯誤"));
      }
    } catch (err) {
      alert("刪除失敗: " + err.message);
    }
  }
  return (
    <AuthenticatedLayout noContainer>
      <div className="reviews-container">
        {/* 側欄 */}
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
                  setLocationName(""); setLocationSearch("");
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
              <input
                type="text"
                placeholder="搜尋地點名稱"
                value={locationSearch}
                onChange={e => setLocationSearch(e.target.value)}
                style={{
                  width: "100%", fontSize: 12, border: "1px solid #d6d6d6",
                  borderRadius: 4, padding: 3, marginBottom: 4
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
            {/* 日期快速選擇 */}
            <div style={{ marginBottom: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button type="button" style={{ fontSize: 12, padding: "2px 7px", borderRadius: 4, border: "1px solid #ddd", background: "#f8f8fa", cursor: "pointer" }}
                onClick={() => { const [s, e] = getThisYearRange(); setStartDate(s); setEndDate(e); }}>今年</button>
              <button type="button" style={{ fontSize: 12, padding: "2px 7px", borderRadius: 4, border: "1px solid #ddd", background: "#f8f8fa", cursor: "pointer" }}
                onClick={() => { const [s, e] = getThisMonthRange(); setStartDate(s); setEndDate(e); }}>本月</button>
              <button type="button" style={{ fontSize: 12, padding: "2px 7px", borderRadius: 4, border: "1px solid #ddd", background: "#f8f8fa", cursor: "pointer" }}
                onClick={() => { const [s, e] = getThisWeekRange(); setStartDate(s); setEndDate(e); }}>本週</button>
              <button type="button" style={{ fontSize: 12, padding: "2px 7px", borderRadius: 4, border: "1px solid #ddd", background: "#f8f8fa", cursor: "pointer" }}
                onClick={() => { const [s, e] = getYesterdayRange(); setStartDate(s); setEndDate(e); }}>昨天</button>
            </div>
            {/* 日期區間 */}
            <div className="reviews-date-range" style={{ flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
              <label style={{ fontSize: 13, color: "#555", marginBottom: 3 }}>評論查詢區間：</label>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <input type="date" value={startDate} max={endDate} onChange={e => setStartDate(e.target.value)}
                  style={{ fontSize: 13, border: "1px solid #d6d6d6", borderRadius: 4, padding: 3, width: 110 }} />
                <span style={{ margin: "0 2px" }}>~</span>
                <input type="date" value={endDate} min={startDate} max={maxDate} onChange={e => setEndDate(e.target.value)}
                  style={{ fontSize: 13, border: "1px solid #d6d6d6", borderRadius: 4, padding: 3, width: 110 }} />
              </div>
              <div style={{ fontSize: 12, color: "#b2b2b2", marginTop: 3 }}>（結束日「不含當天」，最大只能到昨天）</div>
            </div>
            {/* 回覆狀態統計區 */}
            <ul className="reviews-folder-list">
              <li className={replyFilter === "all" ? "active" : ""} style={{ cursor: "pointer" }}
                onClick={() => handleSetReplyFilter("all")}
              >評論數量 <span>{summary.total}</span></li>
              <li className={replyFilter === "replied" ? "active" : ""} style={{ cursor: "pointer" }}
                onClick={() => handleSetReplyFilter("replied")}
              >已回覆 <span>{summary.replied}</span></li>
              <li className={replyFilter === "unreplied" ? "active" : ""} style={{ cursor: "pointer" }}
                onClick={() => handleSetReplyFilter("unreplied")}
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
            ) : reviews.length === 0 ? (
              <div style={{ padding: 40, color: "#aaa", textAlign: "center" }}>目前查無評論</div>
            ) : (
              <>
                {reviews.map((r, i) => (
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
                ))}
                {hasMore && !loading && (
                  <div style={{ padding: "16px 0", textAlign: "center" }}>
                    <button
                      onClick={() => setOffset(offset + DEFAULT_LIMIT)}
                      className="reviews-btn"
                      disabled={pageLoading}
                      style={{ minWidth: 100 }}
                    >
                      {pageLoading ? "載入中…" : "載入更多"}
                    </button>
                  </div>
                )}
              </>
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
                  ref={replyInputRef}
                />
                <div className="reviews-detail-actions" style={{ display: "flex", gap: 12 }}>
                  <button
                    className="reviews-reply-btn"
                    onClick={handleReplySubmit}
                  >
                    送出回覆
                  </button>
                  {/* 只有有回覆時顯示刪除按鈕 */}
                  {selectedReview.replyComment && (
                    <button
                      className="reviews-delete-reply-btn"
                      style={{
                        background: "#e53935",
                        color: "#fff",
                        border: "none",
                        padding: "7px 18px",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "0.98rem",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                        transition: "background 0.18s"
                      }}
                      onClick={handleDeleteReply}
                      onMouseOver={e => e.currentTarget.style.background = "#c62828"}
                      onMouseOut={e => e.currentTarget.style.background = "#e53935"}
                    >
                      刪除回覆
                    </button>
                  )}
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