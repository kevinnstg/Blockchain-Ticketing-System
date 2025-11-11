# 🚀 Setup Guide - Blockchain Ticketing System

Panduan ini akan membantu Anda menjalankan Blockchain Ticketing System di komputer lokal Anda.

## 📋 Yang Anda Butuhkan

### Software Requirements
- **Node.js** v16 atau lebih tinggi ([Download](https://nodejs.org/))
- **npm** (termasuk dalam Node.js)
- **Git** (opsional, untuk clone repository)
- **Text Editor** (VS Code recommended)

### Cek Instalasi
```bash
node --version  # Harus v16 atau lebih tinggi
npm --version   # Harus v8 atau lebih tinggi
```

Jika belum terinstall, download dan install Node.js dari: https://nodejs.org/

---

## 📥 Step 1: Download Project

### Opsi A: Via Git Clone
```bash
git clone https://github.com/username/ticketing-blockchain.git
cd ticketing-blockchain
```

### Opsi B: Download ZIP
1. Klik tombol "Code" → "Download ZIP"
2. Extract file ZIP
3. Buka folder hasil extract di terminal

---

## ⚙️ Step 2: Install Dependencies

Jalankan perintah ini satu per satu:

```bash
# 1. Install dependencies untuk Contracts
cd contracts
npm install

# 2. Install dependencies untuk Backend
cd ../backend
npm install

# 3. Install dependencies untuk Frontend
cd ../frontend
npm install

# Kembali ke root folder
cd ..
```

> ⏱️ Proses install bisa memakan waktu 5-10 menit tergantung koneksi internet.

---

## 🔧 Step 3: Konfigurasi Environment Variables

### 3.1 Contracts (.env)

```bash
cd contracts
```

Buat file `.env` dengan isi:
```env
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

> ⚠️ **PENTING**: Private key ini adalah default Hardhat account untuk development lokal. JANGAN GUNAKAN untuk production!

### 3.2 Backend (.env)

```bash
cd ../backend
```

Buat file `.env` dengan isi:
```env
# Contract Address (akan diisi setelah deploy)
CONTRACT_ADDRESS=

# RPC URL (Hardhat local node)
RPC_URL=http://127.0.0.1:8545

# Admin Private Key (sama dengan contracts)
ADMIN_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Server Secret (ganti dengan random string untuk production)
SERVER_SECRET=my-super-secret-key-change-in-production

# Port
PORT=4000
```

> 💡 **Note**: `CONTRACT_ADDRESS` akan diisi setelah deploy smart contract (Step 4)

### 3.3 Frontend (.env.local)

```bash
cd ../frontend
```

Buat file `.env.local` dengan isi:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## 🚀 Step 4: Deploy Smart Contract

Sekarang saatnya deploy smart contract ke blockchain lokal!

### 4.1 Start Hardhat Node

Buka **Terminal 1** dan jalankan:

```bash
cd contracts
npx hardhat node
```

**Expected Output:**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
...
```

> ⚠️ **JANGAN TUTUP TERMINAL INI!** Biarkan tetap berjalan.

### 4.2 Deploy Contract

Buka **Terminal 2** baru dan jalankan:

```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

**Expected Output:**
```
🚀 Deploying TicketRegistry contract...
📝 Deploying with account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
✅ TicketRegistry deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3

⚙️  Next steps:
1. Copy contract address to backend/.env:
   CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### 4.3 Copy Contract Address

**PENTING!** Copy address yang muncul (contoh: `0x5FbDB2315678afecb367f032d93F642f64180aa3`)

Edit file `backend/.env` dan paste address:
```env
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### 4.4 Copy ABI File

Masih di **Terminal 2**, jalankan:

```bash
cp artifacts/contracts/TicketRegistry.sol/TicketRegistry.json ../backend/
```

---

## ▶️ Step 5: Start Backend

Buka **Terminal 3** baru dan jalankan:

```bash
cd backend
npm run dev
```

**Expected Output:**
```
🔗 Connected to blockchain
📝 Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
👤 Admin Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

🚀 Backend server running on http://localhost:4000
📡 API endpoint: http://localhost:4000/api

✨ Ready to accept requests!
```

> ✅ Jika output seperti di atas, backend berhasil running!

---

## 🎨 Step 6: Start Frontend

Buka **Terminal 4** baru dan jalankan:

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

---

## 🎉 Step 7: Akses Aplikasi

Buka browser dan akses:

### 🏠 Landing Page
**URL**: http://localhost:3000

Di sini Anda akan melihat:
- Tombol "Dashboard Panitia" → untuk membuat event dan generate tiket
- Tombol "Gate Verification" → untuk verifikasi tiket
- Statistik sistem
- Link ke "Blockchain Proof"

### 👔 Dashboard Panitia
**URL**: http://localhost:3000/panitia

Fungsi:
- Buat event baru
- Generate tiket untuk event
- Lihat daftar semua tiket

### 🚪 Gate Verification
**URL**: http://localhost:3000/gate

Fungsi:
- Input Ticket ID
- Verifikasi tiket
- Mark tiket sebagai used

### 🔗 Blockchain Proof
**URL**: http://localhost:3000/blockchain-proof

Fungsi:
- Membuktikan data tersimpan di blockchain
- Live verification dari smart contract
- Tutorial cara verifikasi manual

---

## 🧪 Step 8: Test Aplikasi

Mari kita test semua fitur!

### Test 1: Buat Event

1. Buka **Dashboard Panitia** (http://localhost:3000/panitia)
2. Isi form "Buat Event Baru":
   - **Nama Event**: Test Concert 2024
   - **Tanggal**: Pilih tanggal besok
   - **Lokasi**: Jakarta Convention Center
3. Klik **"✨ Buat Event"**
4. ✅ Muncul notifikasi: "Event berhasil dibuat! Event ID: 1"

### Test 2: Generate Tiket

1. Masih di Dashboard Panitia
2. Scroll ke section "Generate Tiket"
3. Isi form:
   - **Event ID**: 1
   - **Jumlah Tiket**: 5
4. Klik **"🎫 Generate Tiket"**
5. ✅ Muncul notifikasi: "5 tiket berhasil digenerate!"
6. Scroll ke bawah, lihat tabel "Daftar Tiket"
7. **Copy salah satu Ticket ID** (contoh: EVENT-1-T-ABC12345)

### Test 3: Verifikasi Tiket

1. Buka **Gate Verification** (http://localhost:3000/gate) di tab baru
2. Paste Ticket ID yang tadi di-copy
3. Klik **"🔍 Verify"**
4. ✅ Muncul card hijau dengan:
   - Status: ✓ VALID
   - Ticket ID
   - Event Name
   - Location
   - Status: ✅ Available

### Test 4: Mark as Used

1. Masih di halaman Gate Verification
2. Klik tombol **"✓ Mark Used"**
3. ✅ Muncul notifikasi: "Tiket berhasil digunakan!"
4. Card berubah merah
5. Status berubah: ❌ Already Used

### Test 5: Verifikasi Tiket yang Sudah Dipakai

1. Klik **"🔄 Reset"**
2. Paste Ticket ID yang sama lagi
3. Klik **"🔍 Verify"**
4. ✅ Muncul card merah dengan status: "❌ Tiket sudah digunakan!"

### Test 6: Lihat Bukti Blockchain

1. Buka **Blockchain Proof** (http://localhost:3000/blockchain-proof)
2. Paste Ticket ID yang tadi
3. Klik **"🔍 Verify On-Chain"**
4. ✅ Lihat data blockchain:
   - Owner Address
   - Event ID
   - Blockchain Timestamp
   - Status (Immutable)

---

## ✅ Verifikasi Setup Berhasil

Cek checklist ini:

- [ ] **Terminal 1**: Hardhat node running ✓
- [ ] **Terminal 2**: Available untuk command ✓
- [ ] **Terminal 3**: Backend running, no errors ✓
- [ ] **Terminal 4**: Frontend running ✓
- [ ] **Browser**: Landing page terbuka ✓
- [ ] **Test 1**: Bisa create event ✓
- [ ] **Test 2**: Bisa generate tickets ✓
- [ ] **Test 3**: Bisa verify ticket ✓
- [ ] **Test 4**: Bisa mark as used ✓
- [ ] **Test 5**: Tiket used terdeteksi ✓
- [ ] **Test 6**: Blockchain proof works ✓

Jika semua ✓, **SELAMAT!** Setup berhasil! 🎉

---

## 🔍 Troubleshooting

### ❌ Problem: "Error HHE3: No Hardhat config file found"

**Solusi:**
```bash
cd contracts
cat hardhat.config.js  # Pastikan file ada
npx hardhat compile    # Compile ulang
```

### ❌ Problem: "Cannot find module 'TicketRegistry.json'"

**Solusi:**
```bash
# Pastikan ABI file sudah di-copy
cd contracts
cp artifacts/contracts/TicketRegistry.sol/TicketRegistry.json ../backend/

# Cek file ada
cd ../backend
ls -la TicketRegistry.json
```

### ❌ Problem: Backend error "Missing CONTRACT_ADDRESS"

**Solusi:**
1. Pastikan smart contract sudah di-deploy
2. Copy contract address dari output deploy
3. Paste ke `backend/.env`
4. Restart backend (Ctrl+C, lalu `npm run dev`)

### ❌ Problem: Frontend tidak connect ke backend

**Solusi:**
1. Cek backend running di port 4000
2. Cek file `frontend/.env.local` berisi:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000/api
   ```
3. Restart frontend

### ❌ Problem: Port sudah digunakan

**Solusi:**
```bash
# Kill process di port tertentu
# Windows:
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:4000 | xargs kill -9
```

### 🆘 Reset Everything

Jika semua cara gagal, reset total:

```bash
# Stop semua terminal (Ctrl+C di masing-masing)

# Hapus cache
cd contracts
npx hardhat clean
rm -rf node_modules

cd ../backend
rm -rf node_modules

cd ../frontend
rm -rf node_modules .next

# Install ulang
cd ../contracts && npm install
cd ../backend && npm install
cd ../frontend && npm install

# Mulai dari Step 4 lagi
```

---

## 🎉 Selamat!

Anda berhasil menjalankan Blockchain Ticketing System!

**Happy Coding!** 🚀
