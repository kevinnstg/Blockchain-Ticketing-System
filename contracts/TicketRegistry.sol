// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title TicketRegistry
 * @dev Smart contract untuk menyimpan dan memverifikasi tiket event
 */
contract TicketRegistry {
    address public admin;
    
    struct TicketInfo {
        address owner;
        bool used;
        uint256 eventId;
        uint256 timestamp;
    }
    
    struct Event {
        string name;
        uint256 date;
        string location;
        bool active;
    }
    
    mapping(bytes32 => TicketInfo) public tickets;
    mapping(uint256 => Event) public events;
    mapping(address => bool) public authorizedVerifiers;
    
    uint256 public eventCounter;
    uint256 public ticketCounter;
    
    event EventCreated(uint256 indexed eventId, string name, uint256 date);
    event TicketRegistered(bytes32 indexed ticketHash, address owner, uint256 indexed eventId);
    event TicketUsed(bytes32 indexed ticketHash, address indexed usedBy, uint256 timestamp);
    event TicketTransferred(bytes32 indexed ticketHash, address from, address to);
    event VerifierAdded(address indexed verifier);
    event VerifierRemoved(address indexed verifier);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier onlyAuthorized() {
        require(msg.sender == admin || authorizedVerifiers[msg.sender], "Not authorized");
        _;
    }
    
    constructor() {
        admin = msg.sender;
        authorizedVerifiers[msg.sender] = true;
    }
    
    /**
     * @dev Membuat event baru
     */
    function createEvent(string memory _name, uint256 _date, string memory _location) 
        external 
        onlyAdmin 
        returns (uint256) 
    {
        eventCounter++;
        events[eventCounter] = Event({
            name: _name,
            date: _date,
            location: _location,
            active: true
        });
        
        emit EventCreated(eventCounter, _name, _date);
        return eventCounter;
    }
    
    /**
     * @dev Register tiket baru ke blockchain
     */
    function registerTicket(bytes32 ticketHash, address owner, uint256 eventId) 
        external 
        onlyAuthorized 
    {
        require(tickets[ticketHash].timestamp == 0, "Ticket already registered");
        require(events[eventId].active, "Event not active");
        
        tickets[ticketHash] = TicketInfo({
            owner: owner,
            used: false,
            eventId: eventId,
            timestamp: block.timestamp
        });
        
        ticketCounter++;
        emit TicketRegistered(ticketHash, owner, eventId);
    }
    
    /**
     * @dev Batch register multiple tickets (untuk efisiensi gas)
     */
    function registerTicketBatch(
        bytes32[] memory ticketHashes, 
        address[] memory owners, 
        uint256 eventId
    ) external onlyAuthorized {
        require(ticketHashes.length == owners.length, "Array length mismatch");
        require(events[eventId].active, "Event not active");
        
        for (uint256 i = 0; i < ticketHashes.length; i++) {
            if (tickets[ticketHashes[i]].timestamp == 0) {
                tickets[ticketHashes[i]] = TicketInfo({
                    owner: owners[i],
                    used: false,
                    eventId: eventId,
                    timestamp: block.timestamp
                });
                ticketCounter++;
                emit TicketRegistered(ticketHashes[i], owners[i], eventId);
            }
        }
    }
    
    /**
     * @dev Verifikasi tiket (read-only)
     */
    function verifyTicket(bytes32 ticketHash) 
        external 
        view 
        returns (
            address owner, 
            bool used, 
            uint256 eventId,
            uint256 timestamp,
            bool isValid
        ) 
    {
        TicketInfo memory t = tickets[ticketHash];
        bool valid = t.timestamp != 0 && !t.used && events[t.eventId].active;
        return (t.owner, t.used, t.eventId, t.timestamp, valid);
    }
    
    /**
     * @dev Tandai tiket sebagai sudah digunakan
     */
    function markUsed(bytes32 ticketHash) external onlyAuthorized {
        require(tickets[ticketHash].timestamp != 0, "Ticket not registered");
        require(!tickets[ticketHash].used, "Ticket already used");
        require(events[tickets[ticketHash].eventId].active, "Event not active");
        
        tickets[ticketHash].used = true;
        emit TicketUsed(ticketHash, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Transfer kepemilikan tiket
     */
    function transferTicket(bytes32 ticketHash, address to) external {
        require(tickets[ticketHash].owner == msg.sender, "Not ticket owner");
        require(!tickets[ticketHash].used, "Ticket already used");
        require(to != address(0), "Invalid recipient");
        
        address from = msg.sender;
        tickets[ticketHash].owner = to;
        emit TicketTransferred(ticketHash, from, to);
    }
    
    /**
     * @dev Tambah verifier yang diotorisasi
     */
    function addVerifier(address verifier) external onlyAdmin {
        authorizedVerifiers[verifier] = true;
        emit VerifierAdded(verifier);
    }
    
    /**
     * @dev Hapus verifier
     */
    function removeVerifier(address verifier) external onlyAdmin {
        authorizedVerifiers[verifier] = false;
        emit VerifierRemoved(verifier);
    }
    
    /**
     * @dev Nonaktifkan event
     */
    function deactivateEvent(uint256 eventId) external onlyAdmin {
        events[eventId].active = false;
    }
    
    /**
     * @dev Get event info
     */
    function getEvent(uint256 eventId) 
        external 
        view 
        returns (
            string memory name,
            uint256 date,
            string memory location,
            bool active
        ) 
    {
        Event memory e = events[eventId];
        return (e.name, e.date, e.location, e.active);
    }
    
    /**
     * @dev Get total statistics
     */
    function getStats() external view returns (uint256 totalEvents, uint256 totalTickets) {
        return (eventCounter, ticketCounter);
    }
}