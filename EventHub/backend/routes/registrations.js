const express = require('express');
const Registration = require('../models/Registration');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user.id })
      .populate('event', 'title date location capacity')
      .sort({ createdAt: -1 });
    return res.json(registrations);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;