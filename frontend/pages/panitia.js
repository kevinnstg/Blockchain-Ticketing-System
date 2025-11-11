import { useState, useEffect } from 'react';

export default function PanitiaPage() {
  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ totalEvents: '0', totalTickets: '0' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form state untuk create event
  const [eventForm, setEventForm] = useState({
    name: '',
    date: '',
    location: ''
  });

  // Form state untuk generate tickets
  const [ticketForm, setTicketForm] = useState({
    eventId: '',
    quantity: 1
  });

  const API_URL = 'http://localhost:4000/api';

  useEffect(() => {
    loadStats();
    loadTickets();
  }, []);

  const loadStats = async () => {
    try {
      const res = await fetch(`${API_URL}/stats`);
      const data = await res.json();
      if (data.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadTickets = async () => {
    try {
      const res = await fetch(`${API_URL}/tickets/list`);
      const data = await res.json();
      if (data.ok) {
        setTickets(data.tickets);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const dateTimestamp = Math.floor(new Date(eventForm.date).getTime() / 1000);
      
      const res = await fetch(`${API_URL}/events/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: eventForm.name,
          date: dateTimestamp,
          location: eventForm.location
        })
      });

      const data = await res.json();

      if (data.ok) {
        setMessage({ 
          type: 'success', 
          text: `Event berhasil dibuat! Event ID: ${data.eventId}` 
        });
        setEventForm({ name: '', date: '', location: '' });
        setTicketForm({ ...ticketForm, eventId: data.eventId });
        loadStats();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTickets = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch(`${API_URL}/tickets/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: ticketForm.eventId,
          quantity: parseInt(ticketForm.quantity)
        })
      });

      const data = await res.json();

      if (data.ok) {
        setMessage({ 
          type: 'success', 
          text: `${data.tickets.length} tiket berhasil digenerate!` 
        });
        loadStats();
        loadTickets();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setMessage({ type: 'success', text: 'Ticket ID copied!' });
    setTimeout(() => setMessage({ type: '', text: '' }), 2000);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🎫 Dashboard Panitia
          </h1>
          <p className="text-gray-600">
            Sistem Verifikasi Tiket Blockchain - Panel Administrator
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Events</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalEvents}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <span className="text-3xl">📅</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Tiket</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalTickets}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <span className="text-3xl">🎟️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Event Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              📅 Buat Event Baru
            </h2>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Nama Event
                </label>
                <input
                  type="text"
                  value={eventForm.name}
                  onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                  className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: Konser Musik 2025"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Event
                </label>
                <input
                  type="datetime-local"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lokasi
                </label>
                <input
                  type="text"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: Jakarta Convention Center"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ Membuat Event...' : '✨ Buat Event'}
              </button>
            </form>
          </div>

          {/* Generate Tickets Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              🎟️ Generate Tiket
            </h2>
            <form onSubmit={handleGenerateTickets} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event ID
                </label>
                <input
                  type="number"
                  value={ticketForm.eventId}
                  onChange={(e) => setTicketForm({ ...ticketForm, eventId: e.target.value })}
                  className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Masukkan Event ID"
                  required
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Event ID didapat setelah membuat event
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Tiket
                </label>
                <input
                  type="number"
                  value={ticketForm.quantity}
                  onChange={(e) => setTicketForm({ ...ticketForm, quantity: e.target.value })}
                  className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Jumlah tiket"
                  required
                  min="1"
                  max="100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maksimal 100 tiket per batch
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ Generating...' : '🎫 Generate Tiket'}
              </button>
            </form>
          </div>
        </div>

        {/* Tickets List */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              📋 Daftar Tiket ({tickets.length})
            </h2>
            <button
              onClick={loadTickets}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              🔄 Refresh
            </button>
          </div>
          
          {tickets.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Belum ada tiket yang digenerate</p>
              <p className="text-sm mt-2">Buat event dan generate tiket untuk memulai</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ticket ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Event ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Created At
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tickets.map((ticket, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">
                        {ticket.ticketId}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {ticket.eventId}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(ticket.createdAt).toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => copyToClipboard(ticket.ticketId)}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          📋 Copy ID
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}