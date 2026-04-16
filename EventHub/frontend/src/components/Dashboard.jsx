import { useState } from 'react';
import EventCard from './EventCard';
import { api } from '../services/api';

const categories = ['All', 'Technology', 'Music', 'Sports', 'Art', 'Business', 'Food', 'Health', 'Education', 'Other'];
const defaultForm = {
  title: '',
  description: '',
  date: '',
  location: '',
  capacity: 50,
  category: 'Technology',
  imageUrl: '',
};

export default function Dashboard({
  auth,
  isLoggedIn,
  events,
  stats,
  onEventsRefresh,
  onStatsRefresh,
  onNotify,
}) {
  const [form, setForm] = useState(defaultForm);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const createEvent = async (event) => {
    event.preventDefault();
    try {
      await api.post('/events', form);
      setForm(defaultForm);
      onNotify('Event created');
      onEventsRefresh();
      onStatsRefresh();
    } catch (err) {
      onNotify(err.response?.data?.message || 'Failed to create event');
    }
  };

  const filteredEvents = events.filter((event) => {
    const query = search.toLowerCase().trim();
    const matchesText =
      !query ||
      event.title?.toLowerCase().includes(query) ||
      event.description?.toLowerCase().includes(query) ||
      event.location?.toLowerCase().includes(query);
    const matchesCategory = activeCategory === 'All' || event.category === activeCategory;
    return matchesText && matchesCategory;
  });

  const organizerMustSearch = auth.user?.role === 'organizer' && search.trim() === '';
  const showEvents =
    !auth.user || auth.user.role === 'user'
      ? true
      : !organizerMustSearch;

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <h2 className="text-4xl font-bold tracking-tight text-slate-100">Discover Events</h2>
        <p className="mt-2 text-slate-300">Find and register for events happening near you</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <input
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-100 outline-none focus:border-fuchsia-500"
            placeholder="Search events..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <aside className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <h3 className="text-sm font-semibold text-slate-200">Live Stats</h3>
          <div className="mt-3 space-y-2 text-sm">
            <div className="rounded-lg bg-slate-800/80 p-3">Total events: {stats.totalEvents}</div>
            <div className="rounded-lg bg-slate-800/80 p-3">Total registrations: {stats.totalRegistrations}</div>
            <div className="rounded-lg bg-slate-800/80 p-3">Fill rate: {stats.fillRate}%</div>
          </div>
        </aside>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`rounded-full px-4 py-2 text-xs font-medium ${
              activeCategory === category
                ? 'border border-fuchsia-400/30 bg-fuchsia-500/20 text-fuchsia-200'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <p className="text-slate-400">
        {showEvents ? `${filteredEvents.length} events found` : 'Start typing above to search your events'}
      </p>

      <div className="space-y-4">
        {!isLoggedIn ? (
          <div className="rounded-xl border border-cyan-700 bg-cyan-950/30 p-6 text-slate-200">
            Login as organizer or user to unlock role-based actions.
          </div>
        ) : null}

        {auth.user?.role === 'organizer' ? (
          <form
            onSubmit={createEvent}
            className="grid gap-2 rounded-xl border border-slate-800 bg-slate-900 p-4 md:grid-cols-2"
          >
            <input
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
              placeholder="Event title"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              required
            />
            <input
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
              placeholder="Location"
              value={form.location}
              onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
              required
            />
            <input
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
              type="datetime-local"
              value={form.date}
              onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
              required
            />
            <input
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
              type="number"
              min="1"
              placeholder="Capacity"
              value={form.capacity}
              onChange={(event) => setForm((current) => ({ ...current, capacity: Number(event.target.value) }))}
              required
            />
            <textarea
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm md:col-span-2 text-slate-100"
              placeholder="Description"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              required
            />
            <select
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
              value={form.category}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
            >
              {categories.filter((item) => item !== 'All').map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <input
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
              placeholder="Image URL (optional)"
              value={form.imageUrl}
              onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))}
            />
            <button className="rounded-lg bg-gradient-to-r from-cyan-400 to-fuchsia-400 px-4 py-2 text-sm font-semibold text-slate-950 md:col-span-2">
              Create Event
            </button>
          </form>
        ) : null}

        {showEvents ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                auth={auth}
                onRefresh={() => {
                  onEventsRefresh();
                  onStatsRefresh();
                }}
                onNotify={onNotify}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-10 text-center text-slate-400">
            Organizer view is hidden. Start typing above to search your events.
          </div>
        )}
      </div>
    </section>
  );
}
