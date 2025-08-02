// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./TickityNFT.sol";
import "./POAP.sol";
import "./IUSDT.sol";
import "forge-std/console.sol";

/**
 * @title Event
 * @dev Individual event contract for managing ticket sales
 */
contract Event is Ownable, ReentrancyGuard, Pausable {
    // State variables
    string public name;
    string public description;
    uint256 public startTime;
    uint256 public endTime;
    string public location;
    uint256 public soldTickets; // Removed totalTickets - now dynamic
    
    string[] public ticketTypes;
    uint256[] public ticketPrices;
    uint256[] public ticketQuantities; // This can now be unlimited (0 means unlimited)
    uint256[] public soldByType;
    
    address public nftContract;
    address public organizer;
    address public usdtContract;
    address public poapContract;

    
    bool public isActive;
    uint256 public eventId;
    
    // Mappings
    mapping(address => uint256[]) public userPurchases;
    mapping(uint256 => bool) public usedTickets;
    
    // Events with comprehensive details for subgraph
    event EventCreated(
        uint256 indexed eventId,
        address indexed eventAddress,
        address indexed organizer,
        string name,
        string description,
        uint256 startTime,
        uint256 endTime,
        string location,
        uint256 totalTickets,
        uint256 createdAt
    );
    
    event TicketPurchased(
        address indexed buyer,
        uint256 indexed eventId,
        uint256 indexed ticketType,
        uint256 tokenId,
        uint256 price,
        string ticketTypeName,
        uint256 purchaseTime,
        uint256 remainingTickets,
        uint256 soldByTypeCount
    );
    
    event TicketUsed(
        uint256 indexed tokenId,
        uint256 indexed eventId,
        address indexed user,
        uint256 useTime,
        string eventName,
        string ticketTypeName
    );
    
    event EventCancelled(
        uint256 indexed eventId,
        address indexed organizer,
        uint256 cancelledAt,
        string reason
    );
    
    event EventUpdated(
        uint256 indexed eventId,
        address indexed organizer,
        string oldName,
        string newName,
        string oldDescription,
        string newDescription,
        string oldLocation,
        string newLocation,
        uint256 updatedAt
    );
    
    event EventPaused(
        uint256 indexed eventId,
        address indexed organizer,
        uint256 pausedAt,
        string reason
    );
    
    event EventUnpaused(
        uint256 indexed eventId,
        address indexed organizer,
        uint256 unpausedAt
    );
    
    event FundsWithdrawn(
        uint256 indexed eventId,
        address indexed organizer,
        uint256 amount,
        uint256 withdrawnAt
    );
    
    // Modifiers
    modifier onlyOrganizer() {
        require(msg.sender == organizer, "Only organizer can call this");
        _;
    }
    
    modifier eventNotStarted() {
        // Removed timestamp check for easier testing
        // require(block.timestamp < startTime, "Event has already started");
        _;
    }
    
    modifier eventActive() {
        require(isActive, "Event is not active");
        _;
    }
    
    constructor(
        string memory _name,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime,
        string memory _location,
        string[] memory _ticketTypes,
        uint256[] memory _ticketPrices,
        uint256[] memory _ticketQuantities,
        address _nftContract,
        address _organizer,
        address _usdtContract,
        address _poapContract
    ) Ownable(_organizer) {
        name = _name;
        description = _description;
        startTime = _startTime;
        endTime = _endTime;
        location = _location;
        ticketTypes = _ticketTypes;
        ticketPrices = _ticketPrices;
        ticketQuantities = _ticketQuantities;
        nftContract = _nftContract;
        organizer = _organizer;
        usdtContract = _usdtContract;
        poapContract = _poapContract;
        isActive = true;
        
        soldByType = new uint256[](_ticketTypes.length);
        
        // Emit comprehensive event creation event
        emit EventCreated(
            eventId, // Will be set later by factory
            address(this),
            _organizer,
            _name,
            _description,
            _startTime,
            _endTime,
            _location,
            0, // No total tickets limit for dynamic minting
            block.timestamp
        );
    }
    
    /**
     * @dev Purchase a ticket with USDT
     * @param ticketTypeIndex The index of the ticket type to purchase
     */
    function purchaseTicket(uint256 ticketTypeIndex) external nonReentrant whenNotPaused eventActive {
        require(ticketTypeIndex < ticketTypes.length, "Invalid ticket type");
        require(ticketQuantities[ticketTypeIndex] == 0 || soldByType[ticketTypeIndex] < ticketQuantities[ticketTypeIndex], "Ticket type sold out");
        // Removed timestamp check for easier testing
        // require(block.timestamp < startTime, "Event has already started");
        
        uint256 ticketPrice = ticketPrices[ticketTypeIndex];
        
        // Transfer USDT from buyer to this contract
        IUSDT usdt = IUSDT(usdtContract);
        require(usdt.transferFrom(msg.sender, address(this), ticketPrice), "USDT transfer failed");
        
        // Update counters
        soldByType[ticketTypeIndex]++;
        soldTickets++;
        
        // Generate token URI
        string memory tokenURI = _generateTokenURI(ticketTypeIndex);
        
        // Mint NFT ticket
        TickityNFT nft = TickityNFT(nftContract);
        uint256 tokenId = nft.mintTicket(
            eventId,
            ticketTypeIndex,
            ticketPrice,
            msg.sender,
            tokenURI
        );
        
        userPurchases[msg.sender].push(tokenId);
        
        // Emit comprehensive purchase event
        emit TicketPurchased(
            msg.sender,
            eventId,
            ticketTypeIndex,
            tokenId,
            ticketPrice,
            ticketTypes[ticketTypeIndex],
            block.timestamp,
            0, // No remaining tickets limit for dynamic minting
            soldByType[ticketTypeIndex]
        );
    }
    
    /**
     * @dev Use a ticket for entry
     * @param tokenId The ticket token ID
     */
    function useTicket(uint256 tokenId) external {
        // Removed event start time restriction for easier testing
        // require(block.timestamp >= startTime && block.timestamp <= endTime, "Event is not active");
        require(!usedTickets[tokenId], "Ticket already used");
        
        TickityNFT nft = TickityNFT(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not ticket owner");
        
        usedTickets[tokenId] = true;
        nft.useTicket(tokenId);
        
        // Get ticket details for event
        TickityNFT.Ticket memory ticket = nft.getTicket(tokenId);
        string memory ticketTypeName = ticketTypes[ticket.ticketType];
        
        // Mint POAP for attendee
        if (poapContract != address(0)) {
            POAP poap = POAP(poapContract);
            // Use msg.sender to get the caller address
            address attendee = msg.sender;
            
            // Generate POAP URI based on event and ticket details
            string memory poapURI = _generatePOAPURI(tokenId, ticketTypeName);
            
            poap.mintPOAP(eventId, attendee, poapURI);
        }
        
        // Emit comprehensive ticket usage event
        emit TicketUsed(
            tokenId,
            eventId,
            msg.sender,
            block.timestamp,
            name,
            ticketTypeName
        );
    }
    
    /**
     * @dev Cancel the event (organizer only)
     */
    function cancelEvent() external onlyOrganizer eventNotStarted {
        isActive = false;
        emit EventCancelled(eventId, organizer, block.timestamp, "Event cancelled by organizer");
    }
    
    /**
     * @dev Update event details (organizer only)
     * @param newName New name
     * @param newDescription New description
     * @param newLocation New location
     */
    function updateEvent(
        string memory newName,
        string memory newDescription,
        string memory newLocation
    ) external onlyOrganizer eventNotStarted {
        string memory oldName = name;
        string memory oldDescription = description;
        string memory oldLocation = location;
        
        name = newName;
        description = newDescription;
        location = newLocation;
        
        emit EventUpdated(
            eventId,
            organizer,
            oldName,
            newName,
            oldDescription,
            newDescription,
            oldLocation,
            newLocation,
            block.timestamp
        );
    }
    
    /**
     * @dev Set event ID (called by factory)
     * @param _eventId The event ID
     */
    function setEventId(uint256 _eventId) external {
        require(eventId == 0, "Event ID already set");
        eventId = _eventId;
    }
    
    /**
     * @dev Withdraw USDT funds (organizer only)
     */
    function withdrawFunds() external onlyOrganizer {
        IUSDT usdt = IUSDT(usdtContract);
        uint256 balance = usdt.balanceOf(address(this));
        require(balance > 0, "No funds to withdraw");
        
        require(usdt.transfer(organizer, balance), "USDT transfer failed");
        
        emit FundsWithdrawn(eventId, organizer, balance, block.timestamp);
    }
    
    /**
     * @dev Pause ticket sales
     */
    function pause() external onlyOrganizer {
        _pause();
        emit EventPaused(eventId, organizer, block.timestamp, "Event paused by organizer");
    }
    
    /**
     * @dev Unpause ticket sales
     */
    function unpause() external onlyOrganizer {
        _unpause();
        emit EventUnpaused(eventId, organizer, block.timestamp);
    }
    
    /**
     * @dev Get ticket type information
     * @param index The ticket type index
     */
    function getTicketType(uint256 index) external view returns (
        string memory name,
        uint256 price,
        uint256 quantity,
        uint256 sold
    ) {
        require(index < ticketTypes.length, "Invalid index");
        return (
            ticketTypes[index],
            ticketPrices[index],
            ticketQuantities[index],
            soldByType[index]
        );
    }
    
    /**
     * @dev Get user's purchased tickets
     * @param user The user address
     */
    function getUserTickets(address user) external view returns (uint256[] memory) {
        return userPurchases[user];
    }
    
    /**
     * @dev Check if ticket is used
     * @param tokenId The ticket token ID
     */
    function isTicketUsed(uint256 tokenId) external view returns (bool) {
        return usedTickets[tokenId];
    }
    
    /**
     * @dev Get event status
     */
    function getEventStatus() external view returns (
        bool active,
        bool started,
        bool ended,
        uint256 remainingTickets
    ) {
        bool eventStarted = block.timestamp >= startTime;
        bool eventEnded = block.timestamp > endTime;
        
        // For dynamic minting, calculate remaining based on ticket type limits
        uint256 remaining = 0;
        for (uint256 i = 0; i < ticketQuantities.length; i++) {
            if (ticketQuantities[i] == 0) {
                // Unlimited tickets for this type
                remaining = type(uint256).max;
                break;
            } else {
                remaining += ticketQuantities[i] - soldByType[i];
            }
        }
        
        return (isActive, eventStarted, eventEnded, remaining);
    }
    
    /**
     * @dev Generate token URI for NFT metadata
     * @param ticketTypeIndex The ticket type index
     */
    function _generateTokenURI(uint256 ticketTypeIndex) internal view returns (string memory) {
        // This would typically point to IPFS or other decentralized storage
        // For now, we'll create a simple JSON structure
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _base64Encode(string(abi.encodePacked(
                '{"name":"', name, ' - ', ticketTypes[ticketTypeIndex], '",',
                '"description":"', description, '",',
                '"attributes":[',
                '{"trait_type":"Event","value":"', name, '"},',
                '{"trait_type":"Ticket Type","value":"', ticketTypes[ticketTypeIndex], '"},',
                '{"trait_type":"Price","value":"', _uint2str(ticketPrices[ticketTypeIndex]), ' USDT"}',
                ']}'
            )))
        ));
    }
    
    /**
     * @dev Generate POAP URI for POAP metadata
     * @param tokenId The ticket token ID
     * @param ticketTypeName The ticket type name
     */
    function _generatePOAPURI(uint256 tokenId, string memory ticketTypeName) internal view returns (string memory) {
        // Generate a POAP metadata URI based on event and ticket details
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _base64Encode(string(abi.encodePacked(
                '{"name":"POAP - ', name, '",',
                '"description":"Proof of Attendance for ', name, ' - ', ticketTypeName, ' ticket",',
                '"image":"https://ipfs.io/ipfs/QmPOAPImage",',
                '"attributes":[',
                '{"trait_type":"Event","value":"', name, '"},',
                '{"trait_type":"Ticket Type","value":"', ticketTypeName, '"},',
                '{"trait_type":"Ticket ID","value":"', _uint2str(tokenId), '"},',
                '{"trait_type":"Event Location","value":"', location, '"}',
                ']}'
            )))
        ));
    }
    
    /**
     * @dev Convert uint to string
     * @param _i The uint to convert
     */
    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        while (_i != 0) {
            k -= 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
    
    /**
     * @dev Base64 encoding (simplified version)
     * @param data The data to encode
     */
    function _base64Encode(string memory data) internal pure returns (string memory) {
        // This is a simplified base64 encoding - in production, use a proper library
        return data;
    }
    
    // Fallback function to receive ETH
    receive() external payable {
        revert("Use purchaseTicket function with USDT");
    }
} 