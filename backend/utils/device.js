const UAParser = require('ua-parser-js'); 
const crypto = require('crypto'); 
function fingerprint(userAgent, ip) { 
  const p = new UAParser(userAgent); 
  const obj = { 
    browser: p.getBrowser(), 
    os: p.getOS(), 
    device: p.getDevice(), 
  }; 
  const raw = JSON.stringify(obj) + '|' + ip; const deviceId = crypto.createHash('sha256').update(raw).digest('hex'); 
  return { 
    deviceId, name: `${obj.os.name || 'OS'} - ${obj.browser.name || 'Browser'}`, 
    meta: obj 
  }; 
} 
module.exports = { fingerprint };
