const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Event = require('./models/Event');
const Registration = require('./models/Registration');

const categories = ['Technology', 'Music', 'Sports', 'Art', 'Business', 'Food', 'Health', 'Education', 'Other'];
const imagePool = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1503428593586-e225b39bddfe?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1200&q=80',
];

function buildEvents(organizerId) {
  return Array.from({ length: 30 }).map((_, index) => {
    const category = categories[index % categories.length];
    const date = new Date();
    date.setDate(date.getDate() + 2 + index);
    return {
      title: `${category} Event ${index + 1}`,
      description: `Join ${category.toLowerCase()} enthusiasts for networking, learning, and live sessions.`,
      date,
      location: `Venue ${index + 1}, City Center`,
      category,
      imageUrl: imagePool[index % imagePool.length],
      capacity: 40 + (index % 5) * 20,
      organizer: organizerId,
    };
  });
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eventdb');

  // Reset collections for deterministic demo data
  await Registration.deleteMany({});
  await Event.deleteMany({});
  await User.deleteMany({});

  const organizerPasswordHash = await bcrypt.hash('password123', 10);
  const userPasswordHash = await bcrypt.hash('password123', 10);

  const organizer = await User.create({
    name: 'Event Organizer',
    email: 'organizer@eventhub.com',
    password: organizerPasswordHash,
    role: 'organizer',
  });

  const users = await User.insertMany(
    Array.from({ length: 40 }).map((_, index) => ({
      name: `Demo User ${index + 1}`,
      email: `user${index + 1}@eventhub.com`,
      password: userPasswordHash,
      role: 'user',
    }))
  );

  const events = buildEvents(organizer._id);
  const insertedEvents = await Event.insertMany(events);

  // Fill 10-12 events with 20-25 registrations each (simple, consistent demo data)
  const demoEventCount = 12;
  const userIds = users.map((u) => u._id);
  const registrations = [];

  insertedEvents.slice(0, demoEventCount).forEach((eventDoc) => {
    const count = 20 + Math.floor(Math.random() * 6); // 20..25
    const chosen = [...userIds]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(count, userIds.length));

    chosen.forEach((userId) => {
      registrations.push({ user: userId, event: eventDoc._id });
    });
  });

  await Registration.insertMany(registrations);

  console.log('Seed completed with 30 events + demo registrations.');
  console.log('Organizer login: organizer@eventhub.com / password123');
  console.log('Example user login: user1@eventhub.com / password123');
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error('Seed failed:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});
