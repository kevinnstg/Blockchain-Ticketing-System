import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function HomePage() {
  const router = useRouter();
  const [stats, setStats] = useState({ totalEvents: '0', totalTickets: '0' });
  const [contractInfo, setContractInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  useEffect(() => {

    const loadData = async () => {
      try {
        const [statsRes, healthRes] = await Promise.all([
          fetch(`${API_URL}/stats`),
          fetch(`${API_URL}/health`)
        ]);
        
        const statsData = await statsRes.json();
        const healthData = await healthRes.json();
        
        if (statsData.ok) setStats(statsData);
        if (healthData.status === 'ok') setContractInfo(healthData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

  loadData();
  }, [API_URL]);
  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob top-0 left-0"></div>
        <div className="absolute w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 top-0 right-0"></div>
        <div className="absolute w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 bottom-0 left-1/2"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="mb-6">
              <span className="text-7xl">🎫</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Blockchain Ticketing System
            </h1>
            <p className="text-xl text-purple-200 mb-2">
              Sistem Verifikasi Tiket Berbasis Blockchain
            </p>
            <p className="text-lg text-purple-300">
              Anti-Pemalsuan • Transparan • Terdesentralisasi
            </p>

            {/* Blockchain Badge */}
            {contractInfo && (
              <div className="mt-6 inline-block">
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-full px-6 py-2 border border-white border-opacity-20">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-white font-medium">
                      Connected to Blockchain
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Panitia Card */}
            <div 
              onClick={() => router.push('/panitia')}
              className="group relative bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20 hover:bg-purple-50 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-2xl"
            >
              <div className="absolute inset-0 bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
              
              <div className="relative">
                {/* <div className="text-6xl mb-4">👔</div> */}
                <h2 className="text-3xl font-bold text-purple-600 mb-3 text-center">
                  Dashboard Panitia
                </h2>
                <p className="text-purple-400 mb-6">
                  Kelola event dan generate tiket. Panel untuk administrator dan event organizer.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-purple-400">
                    <span className="mr-2">✓</span>
                    Buat event baru
                  </li>
                  <li className="flex items-center text-purple-400">
                    <span className="mr-2">✓</span>
                    Generate tiket batch
                  </li>
                  <li className="flex items-center text-purple-400">
                    <span className="mr-2">✓</span>
                    Monitor statistik
                  </li>
                </ul>
                <div className="flex items-center justify-between">
                  <span className="text-purple-400 font-semibold group-hover:translate-x-2 transition-transform">
                    Masuk Dashboard →
                  </span>
                  <div className="bg-blue-500 bg-opacity-20 rounded-full p-3 group-hover:bg-opacity-40 transition">
                    <span className="text-2xl">📊</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gate Card */}
            <div 
              onClick={() => router.push('/gate')}
              className="group relative bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20 hover:bg-green-50 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-2xl"
            >
              <div className="absolute inset-0 bg-linear-to-br from-green-500 to-teal-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
              
              <div className="relative">
                {/* <div className="text-6xl mb-4">🚪</div> */}
                <h2 className="text-3xl font-bold text-green-600 mb-3">
                  Gate Verification
                </h2>
                <p className="text-green-600 mb-6">
                  Verifikasi tiket pengunjung. Panel untuk petugas gate dan security.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-green-600">
                    <span className="mr-2">✓</span>
                    Verifikasi real-time
                  </li>
                  <li className="flex items-center text-green-600">
                    <span className="mr-2">✓</span>
                    Mark tiket used
                  </li>
                  <li className="flex items-center text-green-600">
                    <span className="mr-2">✓</span>
                    Riwayat verifikasi
                  </li>
                </ul>
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold group-hover:translate-x-2 transition-transform">
                    Buka Verifikasi →
                  </span>
                  <div className="bg-green-500 bg-opacity-20 rounded-full p-3 group-hover:bg-opacity-40 transition">
                    <span className="text-2xl">🔍</span>
                  </div>
                </div>
              </div>
            </div>
          </div>



          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white bg-opacity-5 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-10">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Anti-Pemalsuan
              </h3>
              <p className="text-purple-200 text-sm">
                Setiap tiket tercatat di blockchain dengan hash unik yang tidak dapat dipalsukan
              </p>
            </div>
            <div className="bg-white bg-opacity-5 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-10">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Real-time Verification
              </h3>
              <p className="text-purple-200 text-sm">
                Verifikasi instant dengan query langsung ke smart contract blockchain
              </p>
            </div>
            <div className="bg-white bg-opacity-5 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-10">
              <div className="text-4xl mb-3">📝</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Immutable Records
              </h3>
              <p className="text-purple-200 text-sm">
                Data tiket tersimpan permanen di blockchain dan tidak dapat diubah
              </p>
            </div>
          </div>

          {/* Blockchain Info */}
          {contractInfo && (
            <div className="bg-linear-to-r from-purple-900 to-indigo-900 bg-opacity-50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500 border-opacity-30">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="text-sm text-purple-300 mb-1">Smart Contract Address</div>
                  <div className="font-mono text-white text-sm break-all">
                    {contractInfo.contract}
                  </div>
                </div>
                <button
                  onClick={() => router.push('/blockchain-proof')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center space-x-2"
                >
                  <span>🔗</span>
                  <span>Lihat Bukti Blockchain</span>
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-12">
            <p className="text-purple-300 text-sm">
              Powered by Ethereum Smart Contracts • Built with Next.js & Hardhat
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}