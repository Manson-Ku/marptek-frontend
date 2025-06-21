"use client";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import "./reviews.css";

export default function Page() {
  return (
    <AuthenticatedLayout>
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
              <li className="active">All Reviews <span>226</span></li>
              <li>Open <span>186</span></li>
              <li>Replied <span>40</span></li>
              {/* ...更多選單 */}
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
            {[...Array(8)].map((_, i) => (
              <div key={i} className="reviews-list-item">
                <div className="reviews-avatar"></div>
                <div className="reviews-item-content">
                  <div className="reviews-author">評論者名稱 {i + 1}</div>
                  <div className="reviews-snippet">評論內容預覽 Lorem ipsum dolor sit amet.</div>
                </div>
                <div className="reviews-date">2025-06-20</div>
              </div>
            ))}
          </div>
        </main>
        {/* 右側詳情 */}
        <section className="reviews-detail">
          <div className="reviews-detail-header">
            <div className="reviews-detail-title">單篇評論內容</div>
            <div className="reviews-detail-text">
              這裡顯示單一評論的詳細內容，評論者、評論全文、星等等
            </div>
          </div>
          <div className="reviews-detail-reply">
            <textarea className="reviews-reply-input" placeholder="輸入你的回覆內容…" />
            <div className="reviews-detail-actions">
              <button className="reviews-reply-btn">送出回覆</button>
            </div>
          </div>
        </section>
      </div>
    </AuthenticatedLayout>
  );
}
