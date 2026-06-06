const express = require('express');
const TimeLog = require('../models/TimeLog');
const auth    = require('../middleware/auth');
const router  = express.Router();

// POST /api/tracking/batch — Extension sync
router.post('/batch', auth, async (req, res) => {
  try {
    const { logs = [] } = req.body;
    if (!Array.isArray(logs) || logs.length === 0) {
      return res.status(400).json({ error: 'No logs provided' });
    }

    let inserted = 0;
    let skipped  = 0;

    for (const log of logs) {
      const { domain, timeSpent, timestamp, id: clientId } = log;
      if (!domain || !timeSpent || timeSpent <= 0) continue;

      const date = (timestamp || new Date().toISOString()).split('T')[0];

      try {
        // Upsert: accumulate time for same user+domain+date
        await TimeLog.findOneAndUpdate(
          { userId: req.user._id, domain, date },
          { $inc: { timeSpent }, $set: { timestamp: new Date() } },
          { upsert: true, new: true }
        );
        inserted++;
      } catch (e) {
        if (e.code === 11000) skipped++; // duplicate clientId
        else throw e;
      }
    }

    res.json({ success: true, inserted, skipped });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/tracking/time-log — Single log
router.post('/time-log', auth, async (req, res) => {
  try {
    const { domain, timeSpent, timestamp } = req.body;
    if (!domain || !timeSpent) return res.status(400).json({ error: 'domain and timeSpent required' });

    const date = (timestamp || new Date().toISOString()).split('T')[0];
    const log  = await TimeLog.findOneAndUpdate(
      { userId: req.user._id, domain, date },
      { $inc: { timeSpent }, $set: { timestamp: new Date() } },
      { upsert: true, new: true }
    );
    res.json({ log });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/tracking/today
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const logs  = await TimeLog.find({ userId: req.user._id, date: today }).sort({ timeSpent: -1 });
    const total = logs.reduce((a, l) => a + l.timeSpent, 0);
    res.json({ date: today, logs, totalSeconds: total, totalMinutes: Math.round(total / 60) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/tracking/history?days=7
router.get('/history', auth, async (req, res) => {
  try {
    const days   = Math.min(90, parseInt(req.query.days) || 7);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split('T')[0];

    const logs = await TimeLog.find({
      userId: req.user._id,
      date: { $gte: cutoffStr },
    }).sort({ date: 1 });

    // Group by date
    const grouped = {};
    logs.forEach((l) => {
      if (!grouped[l.date]) grouped[l.date] = [];
      grouped[l.date].push(l);
    });

    res.json({ history: grouped, days });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
