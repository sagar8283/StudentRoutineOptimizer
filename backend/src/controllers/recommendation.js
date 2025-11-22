// backend/src/controllers/recommendation.js
const { RoutineLog } = require('../models');

async function getRecommendations(user_id) {
  const logs = await RoutineLog.findAll({ where: { user_id } });

  const hourly = new Array(24).fill(0);
  let totalSleepHrs = 0, sleepCount = 0;

  for (const l of logs) {
    const start = new Date(l.start_time), end = new Date(l.end_time);
    if (l.type === 'sleep') {
      totalSleepHrs += (end - start) / 3600000;
      sleepCount++;
    }
    let cur = new Date(start);
    while (cur < end) {
      hourly[cur.getHours()] += 1;
      cur = new Date(cur.getTime() + 60*1000);
    }
  }

  const topHours = hourly.map((v,i)=>({hour:i,v})).sort((a,b)=>b.v-a.v).slice(0,3);
  const recs = [];
  if (topHours.length && topHours[0].v>0) {
    recs.push(`Best focused window (top hour): ${String(topHours[0].hour).padStart(2,'0')}:00 - ${String((topHours[0].hour+1)%24).padStart(2,'0')}:00`);
  } else {
    recs.push('No data yet — log study sessions to get recommendations.');
  }

  const avgSleep = sleepCount ? (totalSleepHrs / sleepCount) : null;
  return { hourly, avgSleepHours: avgSleep, recs };
}

module.exports = { getRecommendations };
