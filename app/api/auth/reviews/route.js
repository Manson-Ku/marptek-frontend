import { NextResponse } from 'next/server'
import { BigQuery } from '@google-cloud/bigquery'
import fs from 'fs'

const saJsonBase64 = process.env.GCP_SA_JSON
const tmpPath = '/tmp/sa-key.json'

if (!fs.existsSync(tmpPath)) {
  const saJson = Buffer.from(saJsonBase64, 'base64').toString('utf-8')
  fs.writeFileSync(tmpPath, saJson)
}

const bigquery = new BigQuery({
  keyFilename: tmpPath,
  projectId: 'gbp-management-marptek',
})

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const customer_id = searchParams.get('customer_id')
  const start = searchParams.get('start')
  const end = searchParams.get('end')
  const account_name = searchParams.get('account_name')
  const location_name = searchParams.get('location_name')
  const all_names = searchParams.get('all_names')

  // ======= 必要參數檢查 =======
  if (!customer_id) {
    return NextResponse.json({ error: '缺少 customer_id' }, { status: 400 })
  }
  // names 模式不需要 start/end
  if (!all_names && (!start || !end)) {
    return NextResponse.json({ error: '缺少日期區間 (start, end)' }, { status: 400 })
  }

  // ======= names selector =======
  if (all_names === "1") {
    try {
      const sql_names = `
        SELECT DISTINCT account_name, location_name
        FROM \`gbp-management-marptek.gbp_review.reviews_final_p\`
        WHERE customer_id = @customer_id
      `;
      const [rows] = await bigquery.query({
        query: sql_names,
        params: { customer_id }
      });
      const all_account_names = [...new Set(rows.map(r => r.account_name).filter(Boolean))];
      const all_location_names = [...new Set(rows.map(r => r.location_name).filter(Boolean))];
      // 建立 account_name -> [location_name] 映射
      const account_locations_map = {};
      rows.forEach(r => {
        if (!r.account_name || !r.location_name) return;
        if (!account_locations_map[r.account_name]) account_locations_map[r.account_name] = [];
        account_locations_map[r.account_name].push(r.location_name);
      });
      // 去重
      Object.keys(account_locations_map).forEach(k => {
        account_locations_map[k] = [...new Set(account_locations_map[k])];
      });
      return NextResponse.json({ all_account_names, all_location_names, account_locations_map });
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  // ======= 查詢評論主查詢 =======
  let sql = `
    SELECT
      reviewId,
      reviewer.displayName AS displayName,
      reviewer.profilePhotoUrl AS profilePhotoUrl,
      starRating,
      comment,
      createTime_ts,
      reviewReply.comment AS replyComment,
      reviewReply.updateTime AS replyUpdateTime,
      locationId,
      accountId,
      account_name,
      location_name,
      deleted
    FROM \`gbp-management-marptek.gbp_review.reviews_final_p\`
    WHERE customer_id = @customer_id
      AND createTime_ts >= @start
      AND createTime_ts < @end
      AND (deleted IS NULL OR deleted = FALSE)
  `
  // 可選篩選條件
  const params = { customer_id, start, end };

  if (account_name) {
    sql += ` AND account_name = @account_name `
    params.account_name = account_name;
  }
  if (location_name) {
    sql += ` AND location_name = @location_name `
    params.location_name = location_name;
  }
  sql += ` ORDER BY createTime_ts DESC LIMIT 50 `;

  try {
    const [rows] = await bigquery.query({
      query: sql,
      params,
    })
    return NextResponse.json({ reviews: rows })
  } catch (err) {
    // log error 詳細
    console.error('[BQ ERROR]', err.message, { customer_id, start, end, account_name, location_name });
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
