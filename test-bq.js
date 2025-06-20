const { BigQuery } = require('@google-cloud/bigquery');

// 換成你的 key path
const keyFilename = './secrets/sakey.json'; // sa key json
const projectId = 'gbp-management-marptek';

const bigquery = new BigQuery({ keyFilename, projectId });

async function quickTest() {
  const sql = `
    SELECT accountName, customer_id, is_active, upd_datetime
    FROM \`gbp-management-marptek.a_gbp_accounts.list\`
    LIMIT 5
  `;
  const [rows] = await bigquery.query({ query: sql });
  console.log('BQ 測試結果：', rows);
}

quickTest().catch(console.error);
