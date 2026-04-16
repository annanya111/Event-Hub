import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import { api, setAuthToken } from './services/api';

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

const initialAuth = {
  token: localStorage.getItem('token') || '',
  user: JSON.parse(localStorage.getItem('user') || 'null'),
};

function App() {
  const [auth, setAuth] = useState(initialAuth);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ totalEvents: 0, totalRegistrations: 0, fillRate: 0 });
  const [toast, setToast] = useState('');

  const isLoggedIn = useMemo(() => Boolean(auth.token && auth.user), [auth]);

  const syncAuth = (nextAuth) => {
    setAuth(nextAuth);
    setAuthToken(nextAuth.token);
    if (nextAuth.token) {
      localStorage.setItem('token', nextAuth.token);
      localStorage.setItem('user', JSON.stringify(nextAuth.user));
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const loadEvents = async () => {
    const response = await api.get('/events');
    setEvents(response.data);
  };

  const loadStats = async () => {
    if (!auth.token) return;
    const response = await api.get('/events/stats/overview');
    setStats(response.data);
  };

  useEffect(() => {
    setAuthToken(auth.token);
    loadEvents().catch(() => {});
    loadStats().catch(() => {});
  }, [auth.token]);

  useEffect(() => {
    socket.on('registrationUpdated', ({ eventId, registrationCount, fillRate }) => {
      setEvents((current) =>
        current.map((event) => (event._id === eventId ? { ...event, registrationCount, fillRate } : event))
      );
      loadStats().catch(() => {});
    });

    socket.on('eventCreated', (event) => {
      setEvents((current) => [{ ...event, registrationCount: 0, fillRate: 0, registeredUserIds: [] }, ...current]);
      setToast(`New event created: ${event.title}`);
      loadStats().catch(() => {});
    });

    socket.on('eventDeleted', ({ eventId }) => {
      setEvents((current) => current.filter((event) => event._id !== eventId));
      loadStats().catch(() => {});
    });

    socket.on('notification', ({ message }) => {
      setToast(message);
    });

    return () => {
      socket.off('registrationUpdated');
      socket.off('eventCreated');
      socket.off('eventDeleted');
      socket.off('notification');
    };
  }, [auth.token]);

  useEffect(() => {
    document.title = 'Event Hub';
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!isLoggedIn || events.length === 0) return;

    const now = Date.now();
    const upcoming = events
      .filter((event) => {
        const dateMs = new Date(event.date).getTime();
        const diff = dateMs - now;
        return diff > 0 && diff <= 1000 * 60 * 60 * 24 * 3;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (upcoming.length > 0) {
      const first = upcoming[0];
      const key = `upcoming:${first._id}`;
      if (!sessionStorage.getItem(key)) {
        setToast(`Upcoming event: ${first.title} on ${new Date(first.date).toDateString()}`);
        sessionStorage.setItem(key, '1');
      }
    }
  }, [events, isLoggedIn]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-fuchsia-950">
      <Navbar auth={auth} onAuthChange={syncAuth} />
      {isLoggedIn ? (
        <Dashboard
          auth={auth}
          isLoggedIn={isLoggedIn}
          events={events}
          stats={stats}
          onEventsRefresh={loadEvents}
          onStatsRefresh={loadStats}
          onNotify={setToast}
        />
      ) : (
        <section className="mx-auto flex min-h-[calc(100vh-90px)] max-w-6xl items-center justify-center px-4">
          <div className="rounded-3xl border border-fuchsia-500/40 bg-slate-900/70 p-10 text-center shadow-xl shadow-fuchsia-900/20">
            <h2 className="bg-gradient-to-r from-cyan-300 via-indigo-300 to-fuchsia-400 bg-clip-text text-5xl font-bold text-transparent">
              Welcome to Event Hub
            </h2>
            <p className="mt-4 text-xl text-slate-300">Please log in or sign up to view and register for events.</p>
          </div>
        </section>
      )}
      {toast ? (
        <div className="fixed right-4 bottom-4 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-xl">
          {toast}
        </div>
      ) : null}
    </main>
  );
}

export default App;
