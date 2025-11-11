# 🎫 Blockchain Ticketing System

---

## 📖 Daftar Isi

- [Tentang Project](#-tentang-project)
- [Mengapa Blockchain?](#-mengapa-blockchain)
- [Fitur Utama](#-fitur-utama)
- [Demo](#-demo)
- [Tech Stack](#-tech-stack)
- [Cara Kerja](#-cara-kerja)
- [Quick Start](#-quick-start)
- [Panduan Lengkap](#-panduan-lengkap)

---

## 🎯 Tentang Project

Sistem Verifikasi Tiket Blockchain adalah solusi modern untuk mengatasi pemalsuan tiket dan praktik calo dalam event/konser. Dengan memanfaatkan teknologi blockchain, setiap tiket memiliki record yang tidak dapat diubah atau dipalsukan.

### 🎬 Problem yang Diselesaikan

- ❌ **Tiket palsu** yang merugikan pembeli
- ❌ **Praktik calo** yang menaikkan harga tidak wajar
- ❌ **Double spending** - satu tiket digunakan berkali-kali
- ❌ **Tidak ada transparansi** dalam sistem tiket tradisional

### ✅ Solusi Kami

- ✅ **Immutable records** - Data tiket tersimpan permanen di blockchain
- ✅ **Unique ticket hash** - Setiap tiket memiliki hash unik yang tidak bisa dipalsukan
- ✅ **Real-time verification** - Verifikasi instant tanpa delay
- ✅ **Transparent system** - Siapa saja bisa verifikasi keaslian tiket

---

## ✨ Fitur Utama

### 1. 🎪 Dashboard Panitia
- Buat event baru dengan detail lengkap
- Generate tiket dalam batch (1-100 tiket sekaligus)
- Monitor statistik real-time
- Lihat daftar semua tiket yang sudah dibuat

### 2. 🚪 Gate Verification
- Verifikasi tiket dengan input manual (tanpa QR)
- Status real-time: Valid/Invalid/Used
- Mark tiket sebagai "used" setelah verifikasi
- Riwayat verifikasi untuk tracking

### 3. 🔗 Blockchain Proof
- Lihat smart contract address
- Live query ke blockchain
- Tutorial verifikasi manual
- Transparent data view

### 4. 🔒 Security Features
- Hash-based ticket ID
- Server-side secret untuk keamanan tambahan
- Admin-only untuk critical operations
- Authorized verifiers system

---

## 🛠 Tech Stack

### Smart Contract
- **Solidity** `0.8.18` - Smart contract programming language
- **Hardhat** `2.22+` - Ethereum development environment
- **Ethers.js** `v6` - Library untuk interaksi blockchain

### Backend
- **Node.js** `v16+` - JavaScript runtime
- **Express.js** `4.18+` - Web framework
- **Ethers.js** - Blockchain interaction

### Frontend
- **Next.js** `15` - React framework dengan SSR
- **React** `18+` - UI library
- **Tailwind CSS** `3.4+` - Utility-first CSS framework

### Development Tools
- **Hardhat Network** - Local blockchain untuk development
- **VS Code** - Code editor (recommended)
- **Git** - Version control

---

## ⚙️ Cara Kerja

### 🏗 Arsitektur

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Landing    │  │   Panitia    │  │     Gate     │  │
│  │     Page     │  │  Dashboard   │  │ Verification │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │ REST API
┌────────────────────────▼────────────────────────────────┐
│              Backend API (Express.js)                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  • Event Management                              │   │
│  │  • Ticket Generation                             │   │
│  │  • Verification Logic                            │   │
│  │  • Blockchain Transaction Signing                │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────┘
                         │ Web3 / Ethers.js
┌────────────────────────▼────────────────────────────────┐
│         Smart Contract (TicketRegistry.sol)             │
│  ┌──────────────────────────────────────────────────┐   │
│  │  • Ticket Registry (mapping hash -> info)        │   │
│  │  • Event Management                              │   │
│  │  • Ownership Tracking                            │   │
│  │  • Usage Status (used/available)                 │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│              Ethereum Blockchain                        │
│         (Hardhat Local / Testnet / Mainnet)             │
└─────────────────────────────────────────────────────────┘
```

### Alur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                    1. CREATE EVENT                          │
│  Panitia buat event → Smart contract store di blockchain   │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                  2. GENERATE TICKETS                        │
│  Backend generate Ticket ID → Hash tiket → Register on-chain│
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                3. DISTRIBUTE TICKETS                        │
│  Ticket ID dikirim ke pembeli via email/WhatsApp           │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                  4. VERIFICATION                            │
│  Pembeli tunjukkan Ticket ID → Petugas input → Verify on-chain│
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   5. MARK AS USED                           │
│  Jika valid → Mark "used" on-chain → Pembeli masuk         │
└─────────────────────────────────────────────────────────────┘
```

### Technical Flow

1. **Ticket Generation**
   ```
   Ticket ID = EVENT-{eventId}-T-{random8}
   Ticket Hash = keccak256(Ticket ID + Server Secret)
   Smart Contract.registerTicket(hash, owner, eventId)
   ```

2. **Verification**
   ```
   Input: Ticket ID
   Compute: Hash = keccak256(Ticket ID + Server Secret)
   Query: Smart Contract.verifyTicket(hash)
   Return: {owner, used, eventId, isValid}
   ```

3. **Mark Used**
   ```
   Smart Contract.markUsed(hash)
   → Transaction recorded on blockchain
   → Status changed permanently
   ```

---

## 🚀 Quick Start

### Prerequisites

Pastikan sudah terinstall:
- Node.js v16+ ([Download](https://nodejs.org/))
- npm v8+
- Git (optional)

### Installation (5 Menit)

```bash
# 1. Clone repository
git clone https://github.com/kevinnstg/Blockchain-Ticketing-System.git
cd Blockchain-Ticketing-System

# 2. Install dependencies
cd contracts && npm install
cd ../backend && npm install
cd ../frontend && npm install
cd ..

# 3. Setup environment variables
cp contracts/.env.example contracts/.env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 4. Start Hardhat node (Terminal 1)
cd contracts
npx hardhat node

# 5. Deploy contract (Terminal 2)
npx hardhat run scripts/deploy.js --network localhost
# ⚠️ Copy contract address yang muncul!

# 6. Update backend/.env dengan contract address
# CONTRACT_ADDRESS=0x... (paste address yang di-copy)

# 7. Copy ABI file
cp artifacts/contracts/TicketRegistry.sol/TicketRegistry.json ../backend/

# 8. Start backend (Terminal 3)
cd ../backend
npm run dev

# 9. Start frontend (Terminal 4)
cd ../frontend
npm run dev
```

### Access Application

Buka browser:
- 🏠 **Home**: http://localhost:3000
- 👔 **Dashboard**: http://localhost:3000/panitia
- 🚪 **Gate**: http://localhost:3000/gate
- 🔗 **Proof**: http://localhost:3000/blockchain-proof

---

## 📚 Panduan Lengkap

### Untuk Pengguna Baru
📖 Baca SETUP.md - Panduan lengkap step-by-step dengan troubleshooting

### Use Cases

#### 1. Buat Event Pertama Kali

```bash
# 1. Buka http://localhost:3000/panitia
# 2. Isi form:
#    - Nama: "Konser Musik 2024"
#    - Tanggal: Pilih tanggal event
#    - Lokasi: "Jakarta Convention Center"
# 3. Klik "Buat Event"
# 4. ✅ Event ID: 1 (muncul di notifikasi)
```

#### 2. Generate 10 Tiket

```bash
# 1. Di section "Generate Tiket"
# 2. Input:
#    - Event ID: 1
#    - Jumlah: 10
# 3. Klik "Generate Tiket"
# 4. ✅ 10 tiket berhasil dibuat dan muncul di tabel
```

#### 3. Verifikasi Tiket di Gate

```bash
# 1. Copy Ticket ID (contoh: EVENT-1-T-ABC12345)
# 2. Buka http://localhost:3000/gate
# 3. Paste Ticket ID
# 4. Klik "Verify"
# 5. ✅ Muncul info tiket (valid/invalid)
# 6. Jika valid, klik "Mark Used"
# 7. ✅ Status berubah "Already Used"
```
---

<div align="center">

**Made with ❤️ for transparent and secure ticketing**

[⬆ Back to Top](#-blockchain-ticketing-system)

</div>