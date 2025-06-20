// app/api/locations/route.js
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
  if (!customer_id) {
    return NextResponse.json({ error: '缺少 customer_id' }, { status: 400 })
  }

  const sql = `
    SELECT accountID,name,title, customer_id, is_active, upd_datetime
    FROM \`gbp-management-marptek.gbp_location.list\`
    WHERE customer_id = @customer_id
    ORDER BY upd_datetime DESC
    limit 20000
  `

  try {
    const [rows] = await bigquery.query({
      query: sql,
      params: { customer_id }
    })
    return NextResponse.json({ locations: rows })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
