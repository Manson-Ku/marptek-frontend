// app/api/auth/reviews/summary/route.js
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

  if (!customer_id) {
    return NextResponse.json({ error: '缺少 customer_id' }, { status: 400 })
  }
  if (!start || !end) {
    return NextResponse.json({ error: '缺少日期區間 (start, end)' }, { status: 400 })
  }

  // 關鍵改動: 用 DISTINCT reviewId 計算
  let sql = `
    SELECT
      COUNT(DISTINCT reviewId) AS total,
      COUNT(DISTINCT IF(reviewReply.comment IS NOT NULL AND reviewReply.comment != "", reviewId, NULL)) AS replied,
      COUNT(DISTINCT IF(reviewReply.comment IS NULL OR reviewReply.comment = "", reviewId, NULL)) AS unreplied
    FROM \`gbp-management-marptek.gbp_review.reviews_final_p\`
    WHERE customer_id = @customer_id
      AND createTime_ts >= @start
      AND createTime_ts < @end
      AND (deleted IS NULL OR deleted = FALSE)
  `
  const params = { customer_id, start, end }
  if (account_name) {
    sql += ` AND account_name = @account_name `
    params.account_name = account_name
  }
  if (location_name) {
    sql += ` AND location_name = @location_name `
    params.location_name = location_name
  }

  try {
    const [rows] = await bigquery.query({ query: sql, params })
    return NextResponse.json(rows[0])
  } catch (err) {
    console.error('[BQ ERROR][SUMMARY]', err.message, { customer_id, start, end, account_name, location_name })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
