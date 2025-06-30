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

// 日期字串工具
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

export default function Page() {
  const { customerId, loading: customerLoading } = useCustomer();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);

  // 新增群組/地點選單
  const [accountName, setAccountName] = useState("");
  const [locationName, setLocationName] = useState("");
  const [accountOptions, setAccountOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);

  // 日期區間
  const [startDate, setStartDate] = useState(getNDaysAgoStr(30));
  const [endDate, setEndDate] = useState(getYesterdayStr());
  const maxDate = getYesterdayStr();

  // 1. 載入所有 accountOptions
  useEffect(() => {
    if (!customerId) return;
    // 簡易抓 reviews_final_p 中所有 account_name
    fetch(`/api/auth/reviews/accounts?customer_id=${customerId}`)
      .then(res => res.json())
      .then(data => setAccountOptions(data.accounts || []));
  }, [customerId]);

  // 2. 依所選 accountName 載入地點
  useEffect(() => {
    if (!customerId) return;
    let url = `/api/auth/reviews/locations?customer_id=${customerId}`;
    if (accountName) url += `&account_name=${encodeURIComponent(accountName)}`;
    fetch(url)
      .then(res => res.json())
      .then(data => setLocationOptions(data.locations || []));
  }, [customerId, accountName]);

  // 3. 查詢評論
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

  // 只顯示當前群組下地點
  const filteredLocationOptions = locationOptions.filter(opt => !accountName || opt.account_name === accountName);

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
                  setLocationName(""); // 選了群組時重設地點
                }}
                style={{ width: "100%", fontSize: 13, border: "1px solid #d6d6d6", borderRadius: 4, padding: 3 }}
              >
                <option value="">全部群組</option>
                {accountOptions.map(opt =>
                  <option key={opt.account_name} value={opt.account_name}>
                    {opt.account_name}
                  </option>
                )}
              </select>
            </div>

            {/* 地點名稱 */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 13, color: "#555", marginBottom: 2 }}>地點名稱</label>
              <select
                value={locationName}
                onChange={e => setLocationName(e.target.value)}
                style={{ width: "100%", fontSize: 13, border: "1px solid #d6d6d6", borderRadius: 4, padding: 3 }}
              >
                <option value="">全部地點</option>
                {filteredLocationOptions.map(opt =>
                  <option key={opt.location_name} value={opt.location_name}>
                    {opt.location_name}
                  </option>
                )}
              </select>
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
