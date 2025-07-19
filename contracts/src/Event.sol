// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./TickityNFT.sol";

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
    uint256 public totalTickets;
    uint256 public soldTickets;
    
    string[] public ticketTypes;
    uint256[] public ticketPrices;
    uint256[] public ticketQuantities;
    uint256[] public soldByType;
    
    address public nftContract;
    address public organizer;
    
    bool public isActive;
    uint256 public eventId;
    
    // Mappings
    mapping(address => uint256[]) public userPurchases;
    mapping(uint256 => bool) public usedTickets;
    
    // Events
    event TicketPurchased(address indexed buyer, uint256 indexed ticketType, uint256 price, uint256 tokenId);
    event TicketUsed(uint256 indexed tokenId, address indexed user);
    event EventCancelled();
    event EventUpdated();
    
    // Modifiers
    modifier onlyOrganizer() {
        require(msg.sender == organizer, "Only organizer can call this");
        _;
    }
    
    modifier eventNotStarted() {
        require(block.timestamp < startTime, "Event has already started");
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
        uint256 _totalTickets,
        string[] memory _ticketTypes,
        uint256[] memory _ticketPrices,
        uint256[] memory _ticketQuantities,
        address _nftContract,
        address _organizer
    ) Ownable(_organizer) {
        name = _name;
        description = _description;
        startTime = _startTime;
        endTime = _endTime;
        location = _location;
        totalTickets = _totalTickets;
        ticketTypes = _ticketTypes;
        ticketPrices = _ticketPrices;
        ticketQuantities = _ticketQuantities;
        nftContract = _nftContract;
        organizer = _organizer;
        isActive = true;
        
        soldByType = new uint256[](_ticketTypes.length);
    }
    
    /**
     * @dev Purchase a ticket
     * @param ticketTypeIndex The index of the ticket type to purchase
     */
    function purchaseTicket(uint256 ticketTypeIndex) external payable nonReentrant whenNotPaused eventActive {
        require(ticketTypeIndex < ticketTypes.length, "Invalid ticket type");
        require(msg.value == ticketPrices[ticketTypeIndex], "Incorrect payment amount");
        require(soldByType[ticketTypeIndex] < ticketQuantities[ticketTypeIndex], "Ticket type sold out");
        require(soldTickets < totalTickets, "Event sold out");
        require(block.timestamp < startTime, "Event has already started");
        
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
            ticketPrices[ticketTypeIndex],
            msg.sender,
            tokenURI
        );
        
        userPurchases[msg.sender].push(tokenId);
        
        emit TicketPurchased(msg.sender, ticketTypeIndex, ticketPrices[ticketTypeIndex], tokenId);
    }
    
    /**
     * @dev Use a ticket for entry
     * @param tokenId The ticket token ID
     */
    function useTicket(uint256 tokenId) external {
        require(block.timestamp >= startTime && block.timestamp <= endTime, "Event is not active");
        require(!usedTickets[tokenId], "Ticket already used");
        
        TickityNFT nft = TickityNFT(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not ticket owner");
        
        usedTickets[tokenId] = true;
        nft.useTicket(tokenId);
        
        emit TicketUsed(tokenId, msg.sender);
    }
    
    /**
     * @dev Cancel the event (organizer only)
     */
    function cancelEvent() external onlyOrganizer eventNotStarted {
        isActive = false;
        emit EventCancelled();
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
        name = newName;
        description = newDescription;
        location = newLocation;
        emit EventUpdated();
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
     * @dev Withdraw funds (organizer only)
     */
    function withdrawFunds() external onlyOrganizer {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = organizer.call{value: balance}("");
        require(success, "Transfer failed");
    }
    
    /**
     * @dev Pause ticket sales
     */
    function pause() external onlyOrganizer {
        _pause();
    }
    
    /**
     * @dev Unpause ticket sales
     */
    function unpause() external onlyOrganizer {
        _unpause();
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
        uint256 remaining = totalTickets - soldTickets;
        
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
                '{"trait_type":"Price","value":"', _uint2str(ticketPrices[ticketTypeIndex]), ' ETH"}',
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
        revert("Use purchaseTicket function");
    }
} 