const geoip = require('geoip-lite'); 
function geoFromIp(ip) { 
  try { 
    return geoip.lookup(ip) || {}; 
  } 
  catch (e) { 
    return {}; 
  } 
} 
function computeRisk({ 
  knownDevices = [], 
  deviceId, 
  lastSeenHours = 0, 
  failedAttempts = 0, 
  newCountry = false, 
  loginHour 
}) 
{ 
  let score = 0; // New device -> +40 
  if (!knownDevices.includes(deviceId)) score += 40; // Recent impossible travel -> +30 
  if (newCountry) score += 30; // Many failed attempts -> +20 
  if (failedAttempts >= 3) score += 20; // Night login -> +10 (example) 
  if (loginHour < 6 || loginHour > 23) score += 10; // last seen device long ago -> +5 
  if (lastSeenHours > 720) score += 5; // clamp 
  if (score > 100) score = 100; 
  return score; 
} 
module.exports = { geoFromIp, computeRisk };
