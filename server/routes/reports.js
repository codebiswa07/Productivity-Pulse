const express = require('express');
const TimeLog = require('../models/TimeLog');
const auth    = require('../middleware/auth');
const router  = express.Router();

const PRODUCTIVE_DOMAINS = [
  'github.com', 'stackoverflow.com', 'docs.google.com', 'notion.so',
  'coursera.com', 'udemy.com', 'developer.mozilla.org', 'figma.com',
  'linear.app', 'jira.atlassian.com', 'gitlab.com', 'npmjs.com',
];

function calcScore(logs) {
  const total = logs.reduce((a, l) => a + l.timeSpent, 0);
  if (total === 0) return 0;
  const productive = logs
    .filter((l) => PRODUCTIVE_DOMAINS.some((d) => l.domain.includes(d)))
    .reduce((a, l) => a + l.timeSpent, 0);
  return Math.round((productive / total) * 100);
}

// GET /api/reports/daily
router.get('/daily', auth, async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const logs  = await TimeLog.find({ userId: req.user._id, date }).sort({ timeSpent: -1 });
    const total = logs.reduce((a, l) => a + l.timeSpent, 0);

    res.json({
      date,
      totalSeconds: total,
      totalMinutes: Math.round(total / 60),
      productivityScore: calcScore(logs),
      topSites: logs.slice(0, 10).map((l) => ({
        domain: l.domain,
        seconds: l.timeSpent,
        minutes: Math.round(l.timeSpent / 60),
      })),
      goalMinutes: req.user.settings.dailyGoalMinutes,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/reports/weekly
router.get('/weekly', auth, async (req, res) => {
  try {
    const today = new Date();
    const days  = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }

    const logs = await TimeLog.find({
      userId: req.user._id,
      date: { $in: days },
    });

    const grouped = {};
    days.forEach((d) => { grouped[d] = []; });
    logs.forEach((l) => { if (grouped[l.date]) grouped[l.date].push(l); });

    const weekData = days.map((date) => {
      const dayLogs = grouped[date];
      const total   = dayLogs.reduce((a, l) => a + l.timeSpent, 0);
      const d       = new Date(date);
      return {
        date,
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        totalMinutes:      Math.round(total / 60),
        productivityScore: calcScore(dayLogs),
      };
    });

    const weeklyScore = Math.round(
      weekData.reduce((a, d) => a + d.productivityScore, 0) / weekData.filter((d) => d.totalMinutes > 0).length || 0
    );

    res.json({ week: weekData, weeklyProductivityScore: weeklyScore });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
