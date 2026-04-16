const express = require('express');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }).populate('organizer', 'name email');
    const eventIds = events.map((event) => event._id);

    const registrationSummary = await Registration.aggregate([
      { $match: { event: { $in: eventIds } } },
      { $group: { _id: '$event', count: { $sum: 1 }, users: { $addToSet: '$user' } } },
    ]);
    const summaryByEvent = new Map(
      registrationSummary.map((entry) => [entry._id.toString(), { count: entry.count, users: entry.users }])
    );

    const formatted = events.map((event) => {
      const summary = summaryByEvent.get(event._id.toString()) || { count: 0, users: [] };
      const capacity = event.capacity || 1;
      return {
        ...event.toObject(),
        registrationCount: summary.count,
        fillRate: Math.min(100, Math.round((summary.count / capacity) * 100)),
        registeredUserIds: summary.users.map((u) => u.toString()),
      };
    });

    return res.json(formatted);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'organizer') {
      return res.status(403).json({ message: 'Organizer role required' });
    }

    const { title, description, date, location, capacity, category, imageUrl } = req.body;
    const event = await Event.create({
      title,
      description,
      date,
      location,
      capacity,
      category,
      imageUrl,
      organizer: req.user.id,
    });

    const hydrated = await Event.findById(event._id).populate('organizer', 'name email');
    req.app.get('io').emit('eventCreated', hydrated);
    return res.status(201).json(hydrated);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

router.post('/register/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Only users can register' });
    }
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const existing = await Registration.findOne({ user: req.user.id, event: eventId });
    if (existing) {
      return res.status(400).json({ message: 'Already registered' });
    }

    const currentCount = await Registration.countDocuments({ event: eventId });
    if (currentCount >= event.capacity) {
      return res.status(400).json({ message: 'Event is full' });
    }

    await Registration.create({ user: req.user.id, event: eventId });
    const count = await Registration.countDocuments({ event: eventId });
    const fillRate = Math.min(100, Math.round((count / event.capacity) * 100));

    req.app.get('io').emit('registrationUpdated', { eventId, registrationCount: count, fillRate });
    req.app.get('io').emit('notification', {
      type: 'registration',
      message: `A new registration was added to ${event.title}`,
      eventId,
    });

    return res.status(201).json({ message: 'Registered successfully', eventId, registrationCount: count, fillRate });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

router.delete('/register/:id', auth, async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const deleted = await Registration.findOneAndDelete({ user: req.user.id, event: eventId });
    if (!deleted) {
      return res.status(404).json({ message: 'No registration found for user' });
    }

    const count = await Registration.countDocuments({ event: eventId });
    const fillRate = Math.min(100, Math.round((count / event.capacity) * 100));
    req.app.get('io').emit('registrationUpdated', { eventId, registrationCount: count, fillRate });
    return res.json({ message: 'Registration canceled', eventId, registrationCount: count, fillRate });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'organizer') {
      return res.status(403).json({ message: 'Organizer role required' });
    }
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own events' });
    }

    await Event.findByIdAndDelete(req.params.id);
    await Registration.deleteMany({ event: req.params.id });
    req.app.get('io').emit('eventDeleted', { eventId: req.params.id });
    return res.json({ message: 'Event deleted' });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

router.get('/stats/overview', auth, async (req, res) => {
  try {
    const eventFilter = req.user.role === 'organizer' ? { organizer: new mongoose.Types.ObjectId(req.user.id) } : {};
    const events = await Event.find(eventFilter).select('_id capacity');
    const eventIds = events.map((event) => event._id);
    const totalEvents = events.length;
    const totalCapacity = events.reduce((sum, event) => sum + event.capacity, 0);
    const totalRegistrations = await Registration.countDocuments({ event: { $in: eventIds } });
    const fillRate = totalCapacity ? Math.round((totalRegistrations / totalCapacity) * 100) : 0;

    return res.json({ totalEvents, totalRegistrations, fillRate });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;