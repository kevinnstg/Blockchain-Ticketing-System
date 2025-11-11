import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function BlockchainProofPage() {
  const router = useRouter();
  const [contractInfo, setContractInfo] = useState(null);
  const [ticketId, setTicketId] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [txHistory, setTxHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545';

  useEffect(() => {
    const loadContractInfo = async () => {
        try {
        // Pastikan API_URL ada di dependency array jika itu props/state
        const res = await fetch(`${API_URL}/health`); 
        const data = await res.json();
        if (data.status === 'ok') {
            setContractInfo(data);
        }
        } catch (error) {
        console.error('Error loading contract info:', error);
        }
    };

    loadContractInfo();
  }, [API_URL]);

  

  const handleVerifyOnChain = async () => {
    if (!ticketId.trim()) return;

    setLoading(true);
    setVerificationResult(null);

    try {
      const res = await fetch(`${API_URL}/tickets/verify/${encodeURIComponent(ticketId)}`);
      const data = await res.json();

      if (data.ok) {
        setVerificationResult(data);
        
        const timestamp = new Date().toISOString();
        setTxHistory(prev => [{
          ticketId,
          timestamp,
          result: data.ticket.isValid ? 'Valid' : 'Invalid',
          blockchainData: data.ticket
        }, ...prev.slice(0, 4)]);
      }
    } catch (error) {
      console.error('Error verifying:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 10)}...${address.substring(address.length - 8)}`;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp || timestamp === '0') return 'N/A';
    return new Date(parseInt(timestamp) * 1000).toLocaleString('id-ID');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="text-purple-300 hover:text-white mb-4 flex items-center space-x-2"
          >
            <span>←</span>
            <span>Kembali ke Home</span>
          </button>
          
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-5xl">🔗</span>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Bukti Blockchain
                </h1>
                <p className="text-purple-200">
                  Verifikasi transparansi data on-chain
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Contract Info */}
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 bg-opacity-50 backdrop-blur-lg rounded-xl p-6 border border-blue-500 border-opacity-30 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <span className="mr-2">📜</span>
            Smart Contract Information
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-black bg-opacity-20 rounded-lg p-4">
              <div>
                <div className="text-sm text-purple-300 mb-1">Contract Address</div>
                <div className="font-mono text-white text-sm break-all">
                  {contractInfo?.contract || CONTRACT_ADDRESS || 'Loading...'}
                </div>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(contractInfo?.contract || '')}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-white text-sm transition"
              >
                Copy
              </button>
            </div>

            <div className="flex justify-between items-center bg-black bg-opacity-20 rounded-lg p-4">
              <div>
                <div className="text-sm text-purple-300 mb-1">Network</div>
                <div className="text-white font-medium">Ethereum Local Testnet (Hardhat)</div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm">Active</span>
              </div>
            </div>

            <div className="bg-black bg-opacity-20 rounded-lg p-4">
              <div className="text-sm text-purple-300 mb-1">RPC URL</div>
              <div className="font-mono text-white text-sm break-all">
                {RPC_URL}
              </div>
            </div>
          </div>
        </div>

        {/* Live Verification Tool */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <span className="mr-2">🔍</span>
            Live Blockchain Verification
          </h2>
          
          <p className="text-purple-200 mb-4">
            Masukkan Ticket ID untuk memverifikasi data langsung dari blockchain
          </p>

          <div className="flex space-x-3 mb-4">
            <input
              type="text"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyOnChain()}
              placeholder="EVENT-1-T-ABC12345"
              className="flex-1 px-4 py-3 bg-black bg-opacity-30 border border-purple-500 border-opacity-30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={handleVerifyOnChain}
              disabled={loading || !ticketId.trim()}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg text-white font-semibold transition disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Checking...' : '🔍 Verify On-Chain'}
            </button>
          </div>

          {verificationResult && (
            <div className={`rounded-xl p-6 border-2 ${
              verificationResult.ticket.isValid && !verificationResult.ticket.used
                ? 'bg-green-900 bg-opacity-30 border-green-500'
                : 'bg-red-900 bg-opacity-30 border-red-500'
            }`}>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <span className="mr-2">⛓️</span>
                Blockchain Data Retrieved
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black bg-opacity-30 rounded-lg p-4">
                  <div className="text-sm text-purple-300 mb-1">Ticket Hash (On-Chain Key)</div>
                  <div className="font-mono text-white text-xs break-all">
                    {verificationResult.ticket.ticketId}
                  </div>
                </div>

                <div className="bg-black bg-opacity-30 rounded-lg p-4">
                  <div className="text-sm text-purple-300 mb-1">Owner Address</div>
                  <div className="font-mono text-white text-xs break-all">
                    {verificationResult.ticket.owner}
                  </div>
                </div>

                <div className="bg-black bg-opacity-30 rounded-lg p-4">
                  <div className="text-sm text-purple-300 mb-1">Event ID (On-Chain)</div>
                  <div className="text-white font-bold text-lg">
                    #{verificationResult.ticket.eventId}
                  </div>
                </div>

                <div className="bg-black bg-opacity-30 rounded-lg p-4">
                  <div className="text-sm text-purple-300 mb-1">Blockchain Timestamp</div>
                  <div className="text-white text-sm">
                    {formatTimestamp(verificationResult.ticket.timestamp)}
                  </div>
                </div>

                <div className="bg-black bg-opacity-30 rounded-lg p-4">
                  <div className="text-sm text-purple-300 mb-1">Status (Immutable)</div>
                  <div className={`font-bold ${
                    verificationResult.ticket.used ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {verificationResult.ticket.used ? '❌ USED' : '✅ AVAILABLE'}
                  </div>
                </div>

                <div className="bg-black bg-opacity-30 rounded-lg p-4">
                  <div className="text-sm text-purple-300 mb-1">Validity Check</div>
                  <div className={`font-bold ${
                    verificationResult.ticket.isValid ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {verificationResult.ticket.isValid ? '✓ VALID' : '✗ INVALID'}
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <div className="text-yellow-200 font-semibold mb-1">Blockchain Proof</div>
                    <div className="text-yellow-100 text-sm">
                      Data di atas diambil langsung dari smart contract blockchain. 
                      Setiap perubahan status (seperti mark as used) akan tercatat sebagai 
                      transaksi permanen yang tidak dapat diubah atau dihapus.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Transaction History */}
        {txHistory.length > 0 && (
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20 mb-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="mr-2">📜</span>
              Recent Blockchain Queries
            </h2>

            <div className="space-y-3">
              {txHistory.map((tx, index) => (
                <div key={index} className="bg-black bg-opacity-30 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-mono text-white text-sm">{tx.ticketId}</div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      tx.result === 'Valid' 
                        ? 'bg-green-500 bg-opacity-20 text-green-300'
                        : 'bg-red-500 bg-opacity-20 text-red-300'
                    }`}>
                      {tx.result}
                    </div>
                  </div>
                  <div className="text-purple-300 text-xs">
                    Queried at: {new Date(tx.timestamp).toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <span className="mr-2">❓</span>
            Bagaimana Cara Membuktikan Ini Blockchain?
          </h2>

          <div className="space-y-4">
            <div className="bg-black bg-opacity-20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <span className="text-2xl flex-shrink-0">1️⃣</span>
                <div>
                  <div className="text-white font-semibold mb-2">Smart Contract Address</div>
                  <div className="text-purple-200 text-sm">
                    Setiap tiket disimpan di smart contract dengan address tetap. 
                    Anda bisa memverifikasi contract ini di blockchain explorer atau 
                    langsung query via RPC.
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black bg-opacity-20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <span className="text-2xl flex-shrink-0">2️⃣</span>
                <div>
                  <div className="text-white font-semibold mb-2">Immutable Records</div>
                  <div className="text-purple-200 text-sm">
                    Setiap transaksi (register ticket, mark used) tercatat permanent di blockchain. 
                    Data tidak bisa diubah atau dihapus - ini adalah karakteristik blockchain.
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black bg-opacity-20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <span className="text-2xl flex-shrink-0">3️⃣</span>
                <div>
                  <div className="text-white font-semibold mb-2">Direct Query</div>
                  <div className="text-purple-200 text-sm mb-2">
                    Anda bisa query langsung ke blockchain tanpa backend. 
                    Coba gunakan Hardhat console atau web3.js:
                  </div>
                  <div className="bg-black bg-opacity-50 rounded p-3 font-mono text-xs text-green-400 overflow-x-auto">
                    npx hardhat console --network localhost<br/>
                    {'> const contract = await ethers.getContractAt("TicketRegistry", "' + (contractInfo?.contract || 'CONTRACT_ADDRESS') + '")'}<br/>
                    {'> await contract.getStats()'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black bg-opacity-20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <span className="text-2xl flex-shrink-0">4️⃣</span>
                <div>
                  <div className="text-white font-semibold mb-2">Event Logs</div>
                  <div className="text-purple-200 text-sm">
                    Setiap aksi emit event ke blockchain (TicketRegistered, TicketUsed, dll). 
                    Event ini bisa di-track dan diverifikasi oleh siapa saja.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gradient-to-r from-purple-900 to-pink-900 bg-opacity-50 rounded-lg p-4 border border-purple-500 border-opacity-30">
            <div className="text-white font-semibold mb-2">🔬 Untuk Developer</div>
            <div className="text-purple-200 text-sm">
              Source code smart contract tersedia di repository. 
              Anda bisa audit sendiri logika contract dan memverifikasi 
              bahwa semua data memang disimpan on-chain, bukan di database biasa.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}