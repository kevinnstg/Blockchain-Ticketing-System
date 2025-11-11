const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Load contract ABI (Menggunakan metode dari Kode 1, yang lebih baik)
const contractJSON = require('./TicketRegistry.json');
const contractABI = contractJSON.abi; // Extract ABI from JSON

// Blockchain setup
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8545';
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const SERVER_SECRET = process.env.SERVER_SECRET || 'your-secret-key-change-this';

if (!CONTRACT_ADDRESS || !ADMIN_PRIVATE_KEY) {
  console.error('❌ Missing required environment variables!');
  console.error('Please set CONTRACT_ADDRESS and ADMIN_PRIVATE_KEY in .env file');
  process.exit(1);
}

// Setup provider and signer
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);

// Menggunakan log startup yang lebih deskriptif (dari Kode 2)
console.log('🔗 Connected to blockchain');
console.log('📝 Contract Address:', CONTRACT_ADDRESS);
console.log('👤 Admin Address:', wallet.address);

// Helper function: Generate unique ticket ID
function generateTicketId(eventId) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let random = '';
  for (let i = 0; i < 8; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `EVENT-${eventId}-T-${random}`;
}

// Helper function: Compute ticket hash
function computeTicketHash(ticketId) {
  const dataToHash = ticketId + SERVER_SECRET;
  return ethers.keccak256(ethers.toUtf8Bytes(dataToHash));
}

// In-memory storage (untuk demo - ganti dengan database di production)
const ticketDatabase = new Map();

// ==================== ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    contract: CONTRACT_ADDRESS
  });
});

// Get contract stats
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await contract.getStats();
    res.json({
      ok: true,
      totalEvents: stats[0].toString(),
      totalTickets: stats[1].toString()
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Create new event
app.post('/api/events/create', async (req, res) => {
  try {
    const { name, date, location } = req.body;

    if (!name || !date || !location) {
      return res.status(400).json({
        ok: false,
        error: 'Missing required fields: name, date, location'
      });
    }

    console.log('📅 Creating event:', name);

    const tx = await contract.createEvent(name, date, location);
    const receipt = await tx.wait();

    // Extract event ID from event logs
    const eventCreatedLog = receipt.logs.find(
      log => log.fragment && log.fragment.name === 'EventCreated'
    );

    const eventId = eventCreatedLog ? eventCreatedLog.args[0].toString() : null;

    res.json({
      ok: true,
      eventId: eventId,
      txHash: tx.hash,
      message: 'Event created successfully'
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Get event details
app.get('/api/events/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await contract.getEvent(eventId);

    res.json({
      ok: true,
      event: {
        name: event[0],
        date: event[1].toString(),
        location: event[2],
        active: event[3]
      }
    });
  } catch (error) {
    console.error('Error getting event:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Generate tickets for an event
app.post('/api/tickets/generate', async (req, res) => {
  try {
    const { eventId, quantity, ownerAddress } = req.body;

    if (!eventId || !quantity) {
      return res.status(400).json({
        ok: false,
        error: 'Missing required fields: eventId, quantity'
      });
    }

    if (quantity > 100) {
      return res.status(400).json({
        ok: false,
        error: 'Maximum 100 tickets per batch'
      });
    }

    console.log(`🎫 Generating ${quantity} tickets for event ${eventId}...`);

    const tickets = [];
    const ticketHashes = [];
    const owners = [];
    const owner = ownerAddress || ethers.ZeroAddress;

    // Generate ticket IDs and hashes
    for (let i = 0; i < quantity; i++) {
      const ticketId = generateTicketId(eventId);
      const ticketHash = computeTicketHash(ticketId);

      tickets.push({
        ticketId,
        ticketHash,
        eventId,
        owner
      });

      ticketHashes.push(ticketHash);
      owners.push(owner);

      // Store in database
      ticketDatabase.set(ticketId, {
        ticketId,
        ticketHash,
        eventId,
        owner,
        createdAt: new Date().toISOString()
      });
    }

    // Register to blockchain (batch)
    console.log('📝 Registering tickets to blockchain...');
    const tx = await contract.registerTicketBatch(ticketHashes, owners, eventId);
    await tx.wait();

    console.log('✅ Tickets registered successfully');

    res.json({
      ok: true,
      tickets: tickets.map(t => ({
        ticketId: t.ticketId,
        eventId: t.eventId
      })),
      txHash: tx.hash,
      message: `${quantity} tickets generated successfully`
    });
  } catch (error) {
    console.error('Error generating tickets:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Verify ticket by ID
app.get('/api/tickets/verify/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;

    // Compute hash
    const ticketHash = computeTicketHash(ticketId);

    // Get ticket info from blockchain
    const ticketInfo = await contract.verifyTicket(ticketHash);

    // Get ticket metadata from database
    const metadata = ticketDatabase.get(ticketId);

    if (!metadata) {
      return res.status(404).json({
        ok: false,
        error: 'Ticket not found in database'
      });
    }

    // Get event details
    let eventDetails = null;
    if (ticketInfo.eventId) {
      try {
        const event = await contract.getEvent(ticketInfo.eventId.toString());
        eventDetails = {
          name: event[0],
          date: event[1].toString(),
          location: event[2],
          active: event[3]
        };
      } catch (e) {
        console.error('Error getting event details:', e);
      }
    }

    res.json({
      ok: true,
      ticket: {
        ticketId: ticketId,
        owner: ticketInfo.owner,
        used: ticketInfo.used,
        eventId: ticketInfo.eventId.toString(),
        timestamp: ticketInfo.timestamp.toString(),
        isValid: ticketInfo.isValid
      },
      event: eventDetails,
      metadata: metadata
    });
  } catch (error) {
    console.error('Error verifying ticket:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Mark ticket as used
app.post('/api/tickets/mark-used', async (req, res) => {
  try {
    const { ticketId } = req.body;

    if (!ticketId) {
      return res.status(400).json({
        ok: false,
        error: 'Missing ticketId'
      });
    }

    // Compute hash
    const ticketHash = computeTicketHash(ticketId);

    // Verify ticket first
    const ticketInfo = await contract.verifyTicket(ticketHash);

    if (ticketInfo.used) {
      return res.status(400).json({
        ok: false,
        error: 'Ticket already used'
      });
    }

    if (!ticketInfo.isValid) {
      return res.status(400).json({
        ok: false,
        error: 'Ticket is not valid'
      });
    }

    console.log('✓ Marking ticket as used:', ticketId);

    // Mark as used on blockchain
    const tx = await contract.markUsed(ticketHash);
    await tx.wait();

    console.log('✅ Ticket marked as used successfully');

    res.json({
      ok: true,
      ticketId: ticketId,
      txHash: tx.hash,
      message: 'Ticket marked as used successfully'
    });
  } catch (error) {
    console.error('Error marking ticket as used:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Get all tickets from database (untuk demo)
app.get('/api/tickets/list', (req, res) => {
  const tickets = Array.from(ticketDatabase.values());
  res.json({
    ok: true,
    tickets: tickets,
    count: tickets.length
  });
});

// === Endpoint Baru dari Kode 2 ===

// Transfer ticket ownership
app.post('/api/tickets/transfer', async (req, res) => {
  try {
    const { ticketId, toAddress, fromPrivateKey } = req.body;

    if (!ticketId || !toAddress || !fromPrivateKey) {
      return res.status(400).json({
        ok: false,
        error: 'Missing required fields'
      });
    }

    const ticketHash = computeTicketHash(ticketId);

    // Create signer from private key
    const ownerWallet = new ethers.Wallet(fromPrivateKey, provider);
    const contractWithOwner = new ethers.Contract(CONTRACT_ADDRESS, contractABI, ownerWallet);

    console.log('🔄 Transferring ticket:', ticketId);

    const tx = await contractWithOwner.transferTicket(ticketHash, toAddress);
    await tx.wait();

    // Update database
    const metadata = ticketDatabase.get(ticketId);
    if (metadata) {
      metadata.owner = toAddress;
      ticketDatabase.set(ticketId, metadata);
    }

    console.log('✅ Ticket transferred successfully');

    res.json({
      ok: true,
      ticketId: ticketId,
      newOwner: toAddress,
      txHash: tx.hash,
      message: 'Ticket transferred successfully'
    });
  } catch (error) {
    console.error('Error transferring ticket:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Blockchain proof endpoint - untuk membuktikan data on-chain
app.get('/api/blockchain/proof/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticketHash = computeTicketHash(ticketId);

    // Get data from blockchain
    const ticketInfo = await contract.verifyTicket(ticketHash);

    // Get transaction receipt if available
    const provider = contract.runner.provider;
    const currentBlock = await provider.getBlockNumber();

    // Get contract code to prove it's a real smart contract
    const contractCode = await provider.getCode(CONTRACT_ADDRESS);

    res.json({
      ok: true,
      proof: {
        ticketId: ticketId,
        ticketHash: ticketHash,
        contractAddress: CONTRACT_ADDRESS,
        contractCodeExists: contractCode !== '0x',
        contractCodeLength: contractCode.length,
        currentBlockNumber: currentBlock,
        onChainData: {
          owner: ticketInfo.owner,
          used: ticketInfo.used,
          eventId: ticketInfo.eventId.toString(),
          timestamp: ticketInfo.timestamp.toString(),
          isValid: ticketInfo.isValid,
          registeredOnChain: ticketInfo.timestamp.toString() !== '0'
        },
        proofOfBlockchain: {
          message: 'Data ini diambil langsung dari blockchain smart contract',
          verification: 'Anda dapat memverifikasi sendiri dengan query langsung ke RPC',
          rpcUrl: process.env.RPC_URL || 'http://127.0.0.1:8545',
          howToVerify: [
            '1. Gunakan Hardhat console: npx hardhat console --network localhost',
            '2. Load contract: const c = await ethers.getContractAt("TicketRegistry", "' + CONTRACT_ADDRESS + '")',
            '3. Query data: await c.verifyTicket("' + ticketHash + '")'
          ]
        }
      }
    });
  } catch (error) {
    console.error('Error getting blockchain proof:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Get blockchain network info
app.get('/api/blockchain/info', async (req, res) => {
  try {
    const provider = contract.runner.provider;
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    const gasPrice = await provider.getFeeData();

    // Get contract stats
    const stats = await contract.getStats();
    const admin = await contract.admin();

    res.json({
      ok: true,
      network: {
        name: network.name,
        chainId: network.chainId.toString()
      },
      blockchain: {
        currentBlock: blockNumber,
        gasPrice: gasPrice.gasPrice ? gasPrice.gasPrice.toString() : 'N/A'
      },
      contract: {
        address: CONTRACT_ADDRESS,
        admin: admin,
        totalEvents: stats[0].toString(),
        totalTickets: stats[1].toString()
      }
    });
  } catch (error) {
    console.error('Error getting blockchain info:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api`);
  console.log('\n✨ Ready to accept requests!\n');
});