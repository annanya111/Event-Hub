import { useMemo, useState } from 'react';
import Modal from './Modal';
import { api } from '../services/api';

export default function EventCard({ event, auth, onRefresh, onNotify }) {
  const [open, setOpen] = useState(false);

  const isOrganizer = auth.user?.role === 'organizer';
  const isUser = auth.user?.role === 'user';
  const isOwner = event.organizer?._id === auth.user?.id;
  const isRegistered = event.registeredUserIds?.includes(auth.user?.id);
  const isFull = event.registrationCount >= event.capacity;

  const progressWidth = useMemo(() => {
    const pct = event.capacity ? (event.registrationCount / event.capacity) * 100 : 0;
    return `${Math.max(0, Math.min(100, Math.round(pct)))}%`;
  }, [event.capacity, event.registrationCount]);

  const register = async () => {
    try {
      await api.post(`/events/register/${event._id}`);
      onNotify('Registration successful');
      onRefresh();
      setOpen(false);
    } catch (err) {
      onNotify(err.response?.data?.message || 'Registration failed');
    }
  };

  const cancel = async () => {
    try {
      await api.delete(`/events/register/${event._id}`);
      onNotify('Registration canceled');
      onRefresh();
      setOpen(false);
    } catch (err) {
      onNotify(err.response?.data?.message || 'Cancel failed');
    }
  };

  const remove = async () => {
    try {
      await api.delete(`/events/${event._id}`);
      onNotify('Event deleted');
      onRefresh();
      setOpen(false);
    } catch (err) {
      onNotify(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <>
      <article
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setOpen(true);
        }}
        className="cursor-pointer overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm transition hover:border-fuchsia-500/20 hover:shadow-fuchsia-500/10"
      >
        <div className="relative h-40">
          <img
            src={
              event.imageUrl ||
              'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80'
            }
            alt={event.title}
            className="h-full w-full object-cover"
          />
          <span className="absolute top-3 left-3 rounded-full border border-fuchsia-300/20 bg-fuchsia-500/15 px-3 py-1 text-xs font-semibold text-fuchsia-200">
            {event.category || 'Other'}
          </span>
        </div>

        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-100">{event.title}</h3>
            <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">{event.fillRate}% full</span>
          </div>

          <p className="line-clamp-2 text-sm text-slate-300">{event.description}</p>

          <div className="h-2 w-full overflow-hidden rounded bg-slate-800">
            <div
              className="h-full rounded bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400"
              style={{ width: progressWidth }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              {event.registrationCount}/{event.capacity} seats
            </span>
            <span className="text-fuchsia-200">Open</span>
          </div>
        </div>
      </article>

      <Modal open={open} onClose={() => setOpen(false)} title={event.title}>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-fuchsia-300/20 bg-fuchsia-500/10 px-3 py-1 text-xs font-semibold text-fuchsia-200">
              {event.category || 'Other'}
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-200">
              {new Date(event.date).toLocaleDateString()}
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded bg-slate-800">
            <div
              className="h-full rounded bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400"
              style={{ width: progressWidth }}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300">Seats</span>
            <span className="font-semibold text-slate-100">
              {event.registrationCount}/{event.capacity}
            </span>
          </div>
          <div className="text-xs text-slate-500">Fill rate: {event.fillRate}%</div>

          <p className="text-sm text-slate-300">{event.description}</p>
          <p className="text-xs text-slate-500">Location: {event.location}</p>
          <p className="text-xs text-slate-500">Organizer: {event.organizer?.name || 'Organizer'}</p>

          {(isUser && !isRegistered) ? (
            <button
              onClick={register}
              disabled={isFull}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isFull ? 'Event is full' : 'Register'}
            </button>
          ) : null}

          {(isUser && isRegistered) ? (
            <button
              onClick={cancel}
              className="w-full rounded-xl bg-gradient-to-r from-amber-300 to-orange-300 px-4 py-3 text-sm font-semibold text-slate-950"
            >
              Cancel registration
            </button>
          ) : null}

          {(isOrganizer && isOwner) ? (
            <button
              onClick={remove}
              className="w-full rounded-xl bg-gradient-to-r from-rose-400 to-red-400 px-4 py-3 text-sm font-semibold text-white"
            >
              Delete event
            </button>
          ) : null}

          {!(isUser || (isOrganizer && isOwner)) ? (
            <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3 text-sm text-slate-300">
              No available actions for your role.
            </div>
          ) : null}
        </div>
      </Modal>
    </>
  );
}
