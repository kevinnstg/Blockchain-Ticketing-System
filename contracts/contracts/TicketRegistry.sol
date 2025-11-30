// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

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
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
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
    
    function createEvent(string memory _name, uint256 _date, string memory _location) 
        external onlyAdmin returns (uint256) 
    {
        eventCounter++;
        events[eventCounter] = Event(_name, _date, _location, true);
        emit EventCreated(eventCounter, _name, _date);
        return eventCounter;
    }
    
    function registerTicket(bytes32 ticketHash, address owner, uint256 eventId) 
        external onlyAuthorized 
    {
        require(tickets[ticketHash].timestamp == 0, "Ticket already registered");
        require(events[eventId].active, "Event not active");
        
        tickets[ticketHash] = TicketInfo(owner, false, eventId, block.timestamp);
        ticketCounter++;
        emit TicketRegistered(ticketHash, owner, eventId);
    }
    
    function registerTicketBatch(
        bytes32[] memory ticketHashes, 
        address[] memory owners, 
        uint256 eventId
    ) external onlyAuthorized {
        require(ticketHashes.length == owners.length, "Array length mismatch");
        require(events[eventId].active, "Event not active");
        
        for (uint256 i = 0; i < ticketHashes.length; i++) {
            if (tickets[ticketHashes[i]].timestamp == 0) {
                tickets[ticketHashes[i]] = TicketInfo(owners[i], false, eventId, block.timestamp);
                ticketCounter++;
                emit TicketRegistered(ticketHashes[i], owners[i], eventId);
            }
        }
    }
    
    function verifyTicket(bytes32 ticketHash) 
        external view 
        returns (address owner, bool used, uint256 eventId, uint256 timestamp, bool isValid) 
    {
        TicketInfo memory t = tickets[ticketHash];
        bool valid = t.timestamp != 0 && !t.used && events[t.eventId].active;
        return (t.owner, t.used, t.eventId, t.timestamp, valid);
    }
    
    function markUsed(bytes32 ticketHash) external onlyAuthorized {
        require(tickets[ticketHash].timestamp != 0, "Ticket not registered");
        require(!tickets[ticketHash].used, "Ticket already used");
        tickets[ticketHash].used = true;
        emit TicketUsed(ticketHash, msg.sender, block.timestamp);
    }
    
    function transferTicket(bytes32 ticketHash, address to) external {
        require(tickets[ticketHash].owner == msg.sender, "Not owner");
        require(!tickets[ticketHash].used, "Ticket already used");
        address from = msg.sender;
        tickets[ticketHash].owner = to;
        emit TicketTransferred(ticketHash, from, to);
    }
    
    function getEventDetail(uint256 eventId) 
        external view 
        returns (string memory name, uint256 date, string memory location, bool active) 
    {
        Event memory e = events[eventId];
        return (e.name, e.date, e.location, e.active);
    }
    
    function getStats() external view returns (uint256 totalEvents, uint256 totalTickets) {
        return (eventCounter, ticketCounter);
    }
}
