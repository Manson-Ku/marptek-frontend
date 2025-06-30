// app/api/auth/reviews/route.js
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
  // const locationId = searchParams.get('location_id') // 之後可加

  if (!customer_id) {
    return NextResponse.json({ error: '缺少 customer_id' }, { status: 400 })
  }
  if (!start || !end) {
    return NextResponse.json({ error: '缺少日期區間 (start, end)' }, { status: 400 })
  }

  // 強制格式檢查 YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(start) || !dateRegex.test(end)) {
    return NextResponse.json({ error: '日期格式錯誤，須為 YYYY-MM-DD' }, { status: 400 })
  }

  // 用 createTime_ts 分區
  const sql = `
    SELECT
      reviewId,
      reviewer.displayName AS displayName,
      reviewer.profilePhotoUrl AS profilePhotoUrl,
      starRating,
      comment,
      createTime_ts,
      reviewReply.Comment AS replyComment,
      reviewReply.UpdateTime AS replyUpdateTime,
      locationId,
      accountId,
      deleted
    FROM \`gbp-management-marptek.gbp_review.reviews_final_p\`
    WHERE customer_id = @customer_id
      AND createTime_ts >= @start
      AND createTime_ts < @end
      AND (deleted IS NULL OR deleted = FALSE)
    ORDER BY createTime_ts DESC
    LIMIT 50
  `;

  try {
    const [rows] = await bigquery.query({
      query: sql,
      params: {
        customer_id,
        start,
        end,
      },
    })
    return NextResponse.json({ reviews: rows })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
