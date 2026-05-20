const https = require('https');
const url = 'https://script.google.com/macros/s/AKfycbzFaeymHhdsSw_f4HdOkVJqSHxR5kgcdYsPtSUsxtkAmyHy3XEP-quQaR4s7MYC2Lbn/exec?t=1';
https.get(url, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('count=', json.length);
      console.log(JSON.stringify(json.slice(0, 5), null, 2));
    } catch (e) {
      console.error('parse error', e.message);
      console.error(data.slice(0, 400));
    }
  });
}).on('error', err => {
  console.error('fetch error', err.message);
});
