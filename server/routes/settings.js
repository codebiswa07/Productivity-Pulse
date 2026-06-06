const express = require('express');
const User    = require('../models/User');
const auth    = require('../middleware/auth');
const router  = express.Router();

// GET /api/settings/blocked-sites
router.get('/blocked-sites', auth, async (req, res) => {
  res.json({ blockedSites: req.user.settings.blockedSites || [] });
});

// POST /api/settings/blocked-sites
router.post('/blocked-sites', auth, async (req, res) => {
  try {
    const { domain } = req.body;
    if (!domain) return res.status(400).json({ error: 'domain required' });
    const clean = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].toLowerCase();
    if (!req.user.settings.blockedSites.includes(clean)) {
      req.user.settings.blockedSites.push(clean);
      await req.user.save();
    }
    res.json({ blockedSites: req.user.settings.blockedSites });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/settings/blocked-sites/:domain
router.delete('/blocked-sites/:domain', auth, async (req, res) => {
  try {
    req.user.settings.blockedSites = req.user.settings.blockedSites.filter(
      (s) => s !== req.params.domain
    );
    await req.user.save();
    res.json({ blockedSites: req.user.settings.blockedSites });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/settings
router.put('/', auth, async (req, res) => {
  try {
    const allowed = ['trackingEnabled', 'blockingEnabled', 'dailyGoalMinutes', 'timezone'];
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) req.user.settings[k] = req.body[k];
    });
    await req.user.save();
    res.json({ settings: req.user.settings });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/settings
router.get('/', auth, async (req, res) => {
  res.json({ settings: req.user.settings });
});

module.exports = router;
