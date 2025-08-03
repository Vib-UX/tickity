// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./EventWithPriceFeeds.sol";
import "./TickityNFT.sol";
import "./POAP.sol";
import "./IUSDT.sol";
import "forge-std/console.sol";

/**
 * @title EventFactoryWithPriceFeeds
 * @dev Factory contract for creating events with RedStone production price feeds
 * Supports both USD (USDT) and XTZ payments using live price feeds
 */
contract EventFactoryWithPriceFeeds {
    // State variables
    mapping(uint256 => address) public events;
    mapping(address => uint256[]) public organizerEvents;
    uint256 public eventCounter;
    
    address public usdtContract;
    address public poapContract;
    
    // Events
    event EventCreated(
        uint256 indexed eventId,
        address indexed eventAddress,
        address indexed organizer,
        string name,
        uint256 createdAt
    );
    
    event FactoryUpdated(
        address indexed oldUsdtContract,
        address indexed newUsdtContract,
        address indexed oldPoapContract,
        address newPoapContract,
        uint256 updatedAt
    );
    
    /**
     * @dev Constructor
     * @param _usdtContract Address of the USDT contract
     * @param _poapContract Address of the POAP contract
     */
    constructor(address _usdtContract, address _poapContract) {
        require(_usdtContract != address(0), "Invalid USDT contract address");
        require(_poapContract != address(0), "Invalid POAP contract address");
        
        usdtContract = _usdtContract;
        poapContract = _poapContract;
        
        console.log("EventFactoryWithPriceFeeds deployed:");
        console.log("  USDT Contract:", _usdtContract);
        console.log("  POAP Contract:", _poapContract);
    }
    
    /**
     * @dev Create a new event with price feeds
     * @param name Event name
     * @param description Event description
     * @param startTime Event start time
     * @param endTime Event end time
     * @param location Event location
     * @param ticketTypes Array of ticket type names
     * @param ticketPricesUSD Array of ticket prices in USD (6 decimals)
     * @param ticketQuantities Array of ticket quantities
     * @param acceptXTZ Whether to accept XTZ payments
     * @param acceptUSD Whether to accept USD payments
     * @return eventId The ID of the created event
     * @return eventAddress The address of the created event contract
     */
    function createEvent(
        string memory name,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        string memory location,
        string[] memory ticketTypes,
        uint256[] memory ticketPricesUSD,
        uint256[] memory ticketQuantities,
        bool acceptXTZ,
        bool acceptUSD
    ) external returns (uint256 eventId, address eventAddress) {
        require(ticketTypes.length > 0, "Must have at least one ticket type");
        require(ticketTypes.length == ticketPricesUSD.length, "Arrays length mismatch");
        require(ticketTypes.length == ticketQuantities.length, "Arrays length mismatch");
        require(acceptXTZ || acceptUSD, "Must accept at least one payment method");
        
        eventCounter++;
        eventId = eventCounter;
        
        // Create new event contract with price feeds
        EventWithPriceFeeds newEvent = new EventWithPriceFeeds(
            name,
            description,
            startTime,
            endTime,
            location,
            ticketTypes,
            ticketPricesUSD,
            ticketQuantities,
            address(0), // No NFT contract for basic events
            msg.sender, // organizer
            usdtContract,
            poapContract,
            eventId,
            acceptXTZ,
            acceptUSD
        );
        
        eventAddress = address(newEvent);
        events[eventId] = eventAddress;
        organizerEvents[msg.sender].push(eventId);
        
        console.log("Created event with price feeds:");
        console.log("  Event ID:", eventId);
        console.log("  Event Address:", eventAddress);
        console.log("  Organizer:", msg.sender);
        console.log("  Name:", name);
        console.log("  Accepts XTZ:", acceptXTZ);
        console.log("  Accepts USD:", acceptUSD);
        
        emit EventCreated(eventId, eventAddress, msg.sender, name, block.timestamp);
        
        return (eventId, eventAddress);
    }
    
    /**
     * @dev Create a new event with NFT integration and price feeds
     * @param name Event name
     * @param description Event description
     * @param startTime Event start time
     * @param endTime Event end time
     * @param location Event location
     * @param ticketTypes Array of ticket type names
     * @param ticketPricesUSD Array of ticket prices in USD (6 decimals)
     * @param ticketQuantities Array of ticket quantities
     * @param nftContract Address of the NFT contract
     * @param acceptXTZ Whether to accept XTZ payments
     * @param acceptUSD Whether to accept USD payments
     * @return eventId The ID of the created event
     * @return eventAddress The address of the created event contract
     */
    function createEventWithNFT(
        string memory name,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        string memory location,
        string[] memory ticketTypes,
        uint256[] memory ticketPricesUSD,
        uint256[] memory ticketQuantities,
        address nftContract,
        bool acceptXTZ,
        bool acceptUSD
    ) external returns (uint256 eventId, address eventAddress) {
        require(ticketTypes.length > 0, "Must have at least one ticket type");
        require(ticketTypes.length == ticketPricesUSD.length, "Arrays length mismatch");
        require(ticketTypes.length == ticketQuantities.length, "Arrays length mismatch");
        require(acceptXTZ || acceptUSD, "Must accept at least one payment method");
        require(nftContract != address(0), "Invalid NFT contract address");
        
        eventCounter++;
        eventId = eventCounter;
        
        // Create new event contract with price feeds
        EventWithPriceFeeds newEvent = new EventWithPriceFeeds(
            name,
            description,
            startTime,
            endTime,
            location,
            ticketTypes,
            ticketPricesUSD,
            ticketQuantities,
            nftContract,
            msg.sender, // organizer
            usdtContract,
            poapContract,
            eventId,
            acceptXTZ,
            acceptUSD
        );
        
        eventAddress = address(newEvent);
        events[eventId] = eventAddress;
        organizerEvents[msg.sender].push(eventId);
        
        // Register the event with the NFT contract
        TickityNFT nft = TickityNFT(nftContract);
        nft.createEvent(
            eventAddress,
            name,
            description,
            startTime,
            endTime,
            location
        );
        
        console.log("Created event with price feeds and NFT contract:");
        console.log("  Event ID:", eventId);
        console.log("  Event Address:", eventAddress);
        console.log("  NFT Contract:", nftContract);
        console.log("  Organizer:", msg.sender);
        console.log("  Name:", name);
        console.log("  Accepts XTZ:", acceptXTZ);
        console.log("  Accepts USD:", acceptUSD);
        
        emit EventCreated(eventId, eventAddress, msg.sender, name, block.timestamp);
        
        return (eventId, eventAddress);
    }
    
    /**
     * @dev Get all events for an organizer
     * @param organizer Address of the organizer
     * @return Array of event IDs
     */
    function getOrganizerEvents(address organizer) external view returns (uint256[] memory) {
        return organizerEvents[organizer];
    }
    
    /**
     * @dev Get event address by ID
     * @param eventId The event ID
     * @return The event contract address
     */
    function getEventAddress(uint256 eventId) external view returns (address) {
        return events[eventId];
    }
    
    /**
     * @dev Update factory configuration (only owner)
     * @param _usdtContract New USDT contract address
     * @param _poapContract New POAP contract address
     */
    function updateFactoryConfig(address _usdtContract, address _poapContract) external {
        require(_usdtContract != address(0), "Invalid USDT contract address");
        require(_poapContract != address(0), "Invalid POAP contract address");
        
        address oldUsdtContract = usdtContract;
        address oldPoapContract = poapContract;
        
        usdtContract = _usdtContract;
        poapContract = _poapContract;
        
        emit FactoryUpdated(oldUsdtContract, _usdtContract, oldPoapContract, _poapContract, block.timestamp);
    }
} 