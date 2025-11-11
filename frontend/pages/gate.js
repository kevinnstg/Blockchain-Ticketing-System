import { useState } from 'react';

export default function GateVerificationPage() {
  const [ticketId, setTicketId] = useState('');
  const [ticketInfo, setTicketInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [verificationHistory, setVerificationHistory] = useState([]);

  const API_URL = 'http://localhost:4000/api';

  const handleVerifyTicket = async () => {
    if (!ticketId.trim()) {
      setMessage({ type: 'error', text: 'Masukkan Ticket ID terlebih dahulu' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    setTicketInfo(null);

    try {
      const res = await fetch(`${API_URL}/tickets/verify/${encodeURIComponent(ticketId)}`);
      const data = await res.json();

      if (data.ok) {
        setTicketInfo(data);
        
        if (data.ticket.isValid && !data.ticket.used) {
          setMessage({ type: 'success', text: '✅ Tiket VALID - Siap digunakan!' });
        } else if (data.ticket.used) {
          setMessage({ type: 'error', text: '❌ Tiket sudah digunakan!' });
        } else {
          setMessage({ type: 'error', text: '⚠️ Tiket tidak valid!' });
        }

        // Add to history
        setVerificationHistory(prev => [{
          ticketId: ticketId,
          timestamp: new Date().toISOString(),
          status: data.ticket.isValid && !data.ticket.used ? 'valid' : 'invalid',
          used: data.ticket.used
        }, ...prev.slice(0, 9)]);
      } else {
        setMessage({ type: 'error', text: data.error || 'Tiket tidak ditemukan' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkUsed = async () => {
    if (!ticketId.trim()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch(`${API_URL}/tickets/mark-used`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId })
      });

      const data = await res.json();

      if (data.ok) {
        setMessage({ type: 'success', text: '✅ Tiket berhasil digunakan!' });
        
        // Refresh ticket info
        setTimeout(() => handleVerifyTicket(), 1000);
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTicketId('');
    setTicketInfo(null);
    setMessage({ type: '', text: '' });
  };

  const formatDate = (timestamp) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleString('id-ID');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-pink-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Gate Verification
              </h1>
              <p className="text-gray-600">
                Verifikasi tiket masuk event
              </p>
            </div>
            <div className="bg-purple-100 p-4 rounded-full">
              <span className="text-4xl">🔍</span>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg font-semibold ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            {message.text}
          </div>
        )}

        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Input Ticket ID
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ticket ID
              </label>
              <input
                type="text"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyTicket()}
                className="text-black w-full px-4 py- 3 text-lg font-mono border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="EVENT-1-T-ABC123XYZ"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Masukkan kode tiket yang akan diverifikasi
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={handleVerifyTicket}
                disabled={loading || !ticketId.trim()}
                className="bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ Checking...' : '🔍 Verify'}
              </button>

              {ticketInfo && ticketInfo.ticket.isValid && !ticketInfo.ticket.used && (
                <button
                  onClick={handleMarkUsed}
                  disabled={loading}
                  className="bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? '⏳ Processing...' : '✓ Mark Used'}
                </button>
              )}

              <button
                onClick={handleReset}
                disabled={loading}
                className="bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
              >
                🔄 Reset
              </button>
            </div>
          </div>
        </div>

        {/* Ticket Info Display */}
        {ticketInfo && (
          <div className={`rounded-lg shadow-lg p-6 mb-6 ${
            ticketInfo.ticket.isValid && !ticketInfo.ticket.used
              ? 'bg-green-50 border-2 border-green-300'
              : 'bg-red-50 border-2 border-red-300'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Informasi Tiket
              </h2>
              <div className={`px-4 py-2 rounded-full font-bold ${
                ticketInfo.ticket.isValid && !ticketInfo.ticket.used
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
              }`}>
                {ticketInfo.ticket.isValid && !ticketInfo.ticket.used ? '✓ VALID' : 'USED'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Ticket ID</p>
                <p className="font-mono font-bold text-gray-800">{ticketId}</p>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Event ID</p>
                <p className="font-bold text-gray-800">{ticketInfo.ticket.eventId}</p>
              </div>

              {ticketInfo.event && (
                <>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Event Name</p>
                    <p className="font-bold text-gray-800">{ticketInfo.event.name}</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Location</p>
                    <p className="font-bold text-gray-800">{ticketInfo.event.location}</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Event Date</p>
                    <p className="font-bold text-gray-800">
                      {formatDate(ticketInfo.event.date)}
                    </p>
                  </div>
                </>
              )}

              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <p className={`font-bold ${
                  ticketInfo.ticket.used ? 'text-red-600' : 'text-green-600'
                }`}>
                  {ticketInfo.ticket.used ? '❌ Already Used' : '✅ Available'}
                </p>
              </div>

              {ticketInfo.ticket.timestamp !== '0' && (
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Registered At</p>
                  <p className="font-bold text-gray-800">
                    {formatDate(ticketInfo.ticket.timestamp)}
                  </p>
                </div>
              )}

              <div className="bg-white p-4 rounded-lg md:col-span-2">
                <p className="text-sm text-gray-500 mb-1">Owner Address</p>
                <p className="font-mono text-xs text-gray-800 break-all">
                  {ticketInfo.ticket.owner}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Verification History */}
        {verificationHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Riwayat Verifikasi
            </h2>
            <div className="space-y-2">
              {verificationHistory.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-mono text-sm font-bold text-gray-800">{item.ticketId}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.timestamp).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.status === 'valid' && !item.used
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.status === 'valid' && !item.used ? '✓ Valid' : '✗ Invalid'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}