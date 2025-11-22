// backend/src/controllers/schedule.js
const { Task } = require('../models');

async function autoSchedule(user_id) {
  const tasks = await Task.findAll({
    where: { user_id, status: 'pending' },
    order: [['priority', 'DESC'], ['deadline', 'ASC']]
  });

  const scheduled = tasks.filter(t => t.scheduled_start && t.scheduled_end)
                         .map(t => ({ start: new Date(t.scheduled_start), end: new Date(t.scheduled_end) }));

  function isFree(start, end) {
    return !scheduled.some(s => !(end <= s.start || start >= s.end));
  }

  const now = new Date();
  let scheduledCount = 0;

  for (const t of tasks) {
    if (t.scheduled_start && t.scheduled_end) continue;
    const required = t.duration_minutes * 60 * 1000;
    const deadline = t.deadline ? new Date(t.deadline) : new Date(Date.now() + 24*3600*1000);

    for (let end = new Date(deadline); end > now; end = new Date(end.getTime() - 15*60*1000)) {
      const start = new Date(end.getTime() - required);
      if (start < now) continue;
      if (isFree(start, end)) {
        t.scheduled_start = start;
        t.scheduled_end = end;
        await t.save();
        scheduled.push({ start, end });
        scheduledCount++;
        break;
      }
    }
  }

  return { ok: true, scheduledCount };
}

module.exports = { autoSchedule };
