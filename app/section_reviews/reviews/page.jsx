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

export default function Page() {
  const { customerId, loading: customerLoading } = useCustomer();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null); // <--- 新增

  useEffect(() => {
    if (!customerId) return;
    setLoading(true);
    fetch(`/api/auth/reviews?customer_id=${customerId}`)
      .then(res => res.json())
      .then(data => {
        setReviews(data.reviews || []);
        setLoading(false);
        setSelectedReview((data.reviews && data.reviews[0]) || null); // 預設選第一筆
      })
      .catch(() => setLoading(false));
  }, [customerId]);

  return (
    <AuthenticatedLayout noContainer>
      <div className="reviews-container">
        {/* 左側側欄 */}
        <aside className="reviews-sidebar">
          <div className="reviews-sidebar-header">Reviews</div>
          <div className="reviews-sidebar-content">
            <div className="reviews-date-range">
              <div className="reviews-date-label">2024-12-21 ~ 2025-06-21</div>
              <button className="reviews-date-btn">更改日期</button>
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
                    {r.createTime ? r.createTime.split("T")[0] : "--"}
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
                    {selectedReview.createTime ? selectedReview.createTime.replace("T", " ").split(".")[0] : ""}
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
                        ({selectedReview.replyUpdateTime.replace("T", " ").split(".")[0]})
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
