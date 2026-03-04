import https from 'https'

const urls = [
  `https://docs.google.com/spreadsheets/d/1O_7K012fvpLpLFdhOXXa6C3qFAldJ5DseBV_hcqSLzo/gviz/tq?tqx=out:json&sheet=FY%2023-24&tq=select%20*&cachebust=${Date.now()}`,
  `https://docs.google.com/spreadsheets/d/1O_7K012fvpLpLFdhOXXa6C3qFAldJ5DseBV_hcqSLzo/gviz/tq?tqx=out:json&sheet=FY%2024-25&tq=select%20*&cachebust=${Date.now()}`,
  `https://docs.google.com/spreadsheets/d/1O_7K012fvpLpLFdhOXXa6C3qFAldJ5DseBV_hcqSLzo/gviz/tq?tqx=out:json&sheet=FY%2025-26&tq=select%20*&cachebust=${Date.now()}`
]

const REFRESH_INTERVAL = 5 * 60 * 1000; // every 5 minutes

setInterval(() => {
  loadAllSheets(); // call whatever your main data-loading function is
}, REFRESH_INTERVAL);

function fetchUrl(u) {
  return new Promise((resolve) => {
    https.get(u, (res) => {
      let s = ''
      res.on('data', c => s += c)
      res.on('end', () => resolve({ url: u, status: res.statusCode, len: s.length, snippet: s.slice(0, 1200) }))
    }).on('error', (e) => resolve({ url: u, error: e.message }))
  })
}

(async () => {
  for (const u of urls) {
    const r = await fetchUrl(u)
    console.log('---')
    console.log('URL:', r.url)
    if (r.error) console.log('ERROR:', r.error)
    else console.log('STATUS:', r.status, 'LEN:', r.len)
    if (r.snippet) console.log(r.snippet)
  }
})()
