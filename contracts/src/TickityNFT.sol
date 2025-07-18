// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TickityNFT
 * @dev Main NFT contract for Tickity tickets
 */
contract TickityNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    uint256 private _tokenIds;
    uint256 private _eventIds;
    
    // Structs
    struct Ticket {
        uint256 eventId;
        uint256 ticketType;
        uint256 price;
        bool isUsed;
        bool isRefunded;
        uint256 mintedAt;
        address eventContract;
    }
    
    struct Event {
        address eventContract;
        string name;
        string description;
        uint256 startTime;
        uint256 endTime;
        string location;
        bool isActive;
        uint256 totalTickets;
        uint256 soldTickets;
    }
    
    // State variables
    mapping(uint256 => Ticket) public tickets;
    mapping(uint256 => Event) public events;
    mapping(address => uint256[]) public userTickets;
    mapping(uint256 => mapping(uint256 => uint256)) public eventTicketTypePrices;
    
    // Events
    event TicketMinted(uint256 indexed tokenId, uint256 indexed eventId, address indexed owner);
    event TicketUsed(uint256 indexed tokenId, uint256 indexed eventId);
    event TicketRefunded(uint256 indexed tokenId, uint256 indexed eventId);
    event EventCreated(uint256 indexed eventId, address indexed eventContract, string name);
    
    // Modifiers
    modifier onlyEventContract(uint256 eventId) {
        require(events[eventId].eventContract == msg.sender, "Only event contract can call this");
        _;
    }
    
    modifier ticketExists(uint256 tokenId) {
        require(ownerOf(tokenId) != address(0), "Ticket does not exist");
        _;
    }
    
    modifier ticketNotUsed(uint256 tokenId) {
        require(!tickets[tokenId].isUsed, "Ticket already used");
        _;
    }
    
    modifier ticketNotRefunded(uint256 tokenId) {
        require(!tickets[tokenId].isRefunded, "Ticket already refunded");
        _;
    }
    
    constructor() ERC721("Tickity NFT", "TICKITY") Ownable(msg.sender) {
        _tokenIds = 1; // Start from 1
        _eventIds = 1; // Start from 1
    }
    
    /**
     * @dev Mint a new ticket
     * @param eventId The event ID
     * @param ticketType The type of ticket
     * @param price The price of the ticket
     * @param recipient The recipient of the ticket
     * @param tokenURI The metadata URI for the ticket
     */
    function mintTicket(
        uint256 eventId,
        uint256 ticketType,
        uint256 price,
        address recipient,
        string memory tokenURI
    ) external onlyEventContract(eventId) returns (uint256) {
        require(events[eventId].isActive, "Event is not active");
        require(events[eventId].soldTickets < events[eventId].totalTickets, "Event sold out");
        
        uint256 newTokenId = _tokenIds;
        _tokenIds++;
        
        _safeMint(recipient, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        tickets[newTokenId] = Ticket({
            eventId: eventId,
            ticketType: ticketType,
            price: price,
            isUsed: false,
            isRefunded: false,
            mintedAt: block.timestamp,
            eventContract: events[eventId].eventContract
        });
        
        userTickets[recipient].push(newTokenId);
        events[eventId].soldTickets++;
        
        emit TicketMinted(newTokenId, eventId, recipient);
        return newTokenId;
    }
    
    /**
     * @dev Mark a ticket as used
     * @param tokenId The ticket ID
     */
    function useTicket(uint256 tokenId) external ticketExists(tokenId) ticketNotUsed(tokenId) ticketNotRefunded(tokenId) {
        require(ownerOf(tokenId) == msg.sender || events[tickets[tokenId].eventId].eventContract == msg.sender, "Not authorized");
        
        tickets[tokenId].isUsed = true;
        emit TicketUsed(tokenId, tickets[tokenId].eventId);
    }
    
    /**
     * @dev Refund a ticket
     * @param tokenId The ticket ID
     */
    function refundTicket(uint256 tokenId) external ticketExists(tokenId) ticketNotUsed(tokenId) ticketNotRefunded(tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Not ticket owner");
        require(block.timestamp < events[tickets[tokenId].eventId].startTime, "Event already started");
        
        tickets[tokenId].isRefunded = true;
        events[tickets[tokenId].eventId].soldTickets--;
        
        emit TicketRefunded(tokenId, tickets[tokenId].eventId);
    }
    
    /**
     * @dev Create a new event
     * @param eventContract The address of the event contract
     * @param name The name of the event
     * @param description The description of the event
     * @param startTime The start time of the event
     * @param endTime The end time of the event
     * @param location The location of the event
     * @param totalTickets The total number of tickets available
     */
    function createEvent(
        address eventContract,
        string memory name,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        string memory location,
        uint256 totalTickets
    ) external onlyOwner {
        uint256 eventId = _eventIds;
        _eventIds++;
        
        events[eventId] = Event({
            eventContract: eventContract,
            name: name,
            description: description,
            startTime: startTime,
            endTime: endTime,
            location: location,
            isActive: true,
            totalTickets: totalTickets,
            soldTickets: 0
        });
        
        emit EventCreated(eventId, eventContract, name);
    }
    
    /**
     * @dev Get ticket details
     * @param tokenId The ticket ID
     */
    function getTicket(uint256 tokenId) external view returns (Ticket memory) {
        return tickets[tokenId];
    }
    
    /**
     * @dev Get event details
     * @param eventId The event ID
     */
    function getEvent(uint256 eventId) external view returns (Event memory) {
        return events[eventId];
    }
    
    /**
     * @dev Get user's tickets
     * @param user The user address
     */
    function getUserTickets(address user) external view returns (uint256[] memory) {
        return userTickets[user];
    }
    
    /**
     * @dev Check if ticket is valid for entry
     * @param tokenId The ticket ID
     */
    function isTicketValid(uint256 tokenId) external view returns (bool) {
        if (ownerOf(tokenId) == address(0)) return false;
        if (tickets[tokenId].isUsed) return false;
        if (tickets[tokenId].isRefunded) return false;
        
        Event memory eventData = events[tickets[tokenId].eventId];
        if (!eventData.isActive) return false;
        if (block.timestamp < eventData.startTime || block.timestamp > eventData.endTime) return false;
        
        return true;
    }
    
    /**
     * @dev Check if ticket is valid for resale
     * @param tokenId The ticket ID
     */
    function isTicketValidForResale(uint256 tokenId) external view returns (bool) {
        if (ownerOf(tokenId) == address(0)) return false;
        if (tickets[tokenId].isUsed) return false;
        if (tickets[tokenId].isRefunded) return false;
        
        Event memory eventData = events[tickets[tokenId].eventId];
        if (!eventData.isActive) return false;
        if (block.timestamp > eventData.endTime) return false; // Event has ended
        
        return true;
    }
    
    // Override required functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
} 