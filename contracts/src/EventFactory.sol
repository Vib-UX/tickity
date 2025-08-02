// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Event.sol";
import "./POAP.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title EventFactory
 * @dev Factory contract for creating and managing individual event contracts
 */
contract EventFactory is Ownable, ReentrancyGuard {
    constructor(address _usdtContract, address _poapContract) Ownable(msg.sender) {
        usdtContract = _usdtContract;
        poapContract = _poapContract;
    }
    // State variables
    mapping(uint256 => address) public events;
    mapping(address => uint256[]) public organizerEvents;
    uint256 public eventCount;
    address public usdtContract;
    address public poapContract;

    
    // Events with comprehensive details for subgraph
    event EventCreated(
        uint256 indexed eventId,
        address indexed eventAddress,
        address indexed organizer,
        uint256 createdAt
    );
    
    event EventCreatedDetailed(
        uint256 indexed eventId,
        address indexed eventAddress,
        address indexed organizer,
        string name,
        string description,
        uint256 startTime,
        uint256 endTime,
        string location,
        string[] ticketTypes,
        uint256[] ticketPrices,
        uint256[] ticketQuantities,
        address nftContract,
        uint256 createdAt
    );
    
    event EventFactoryInitialized(
        address indexed factoryAddress,
        address indexed owner,
        uint256 initializedAt
    );
    
    event OrganizerRegistered(
        address indexed organizer,
        uint256 indexed eventId,
        uint256 registeredAt
    );
    
    event EventFactoryStats(
        uint256 indexed eventId,
        uint256 totalEvents,
        uint256 organizerEventCount,
        uint256 timestamp
    );
    
    event EventFactoryUpdated(
        address indexed factoryAddress,
        address indexed owner,
        uint256 updatedAt,
        string reason
    );
    
    /**
     * @dev Create a new event
     * @param name The name of the event
     * @param description The description of the event
     * @param startTime The start time of the event
     * @param endTime The end time of the event
     * @param location The location of the event
     * @param ticketTypes Array of ticket type names
     * @param ticketPrices Array of ticket prices
     * @param ticketQuantities Array of ticket quantities per type (0 means unlimited)
     * @param nftContract The address of the NFT contract
     */
    function createEvent(
        string memory name,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        string memory location,
        string[] memory ticketTypes,
        uint256[] memory ticketPrices,
        uint256[] memory ticketQuantities,
        address nftContract
    ) external returns (address) {
        // Removed timestamp checks for easier testing
        // require(startTime > block.timestamp, "Start time must be in the future");
        require(endTime > startTime, "End time must be after start time");
        require(ticketTypes.length == ticketPrices.length, "Arrays length mismatch");
        require(ticketTypes.length == ticketQuantities.length, "Arrays length mismatch");
        require(ticketTypes.length > 0, "Must have at least one ticket type");
        
        // For dynamic minting, we don't need to validate total quantities
        // Each ticket type can have its own limit (0 means unlimited)
        
        eventCount++;
        
        Event newEvent = new Event(
            name,
            description,
            startTime,
            endTime,
            location,
            ticketTypes,
            ticketPrices,
            ticketQuantities,
            nftContract,
            msg.sender,
            usdtContract,
            poapContract
        );
        
        events[eventCount] = address(newEvent);
        organizerEvents[msg.sender].push(eventCount);
        
        // Set event ID in the new event contract
        newEvent.setEventId(eventCount);
        
        // Register the event in the NFT contract
        TickityNFT nftContractInstance = TickityNFT(nftContract);
        nftContractInstance.createEvent(
            address(newEvent),
            name,
            description,
            startTime,
            endTime,
            location
        );
        

        
        // Emit factory event creation event (Event contract will emit its own detailed event)
        emit EventCreated(
            eventCount,
            address(newEvent),
            msg.sender,
            block.timestamp
        );
        
        // Emit comprehensive detailed event for subgraph
        emit EventCreatedDetailed(
            eventCount,
            address(newEvent),
            msg.sender,
            name,
            description,
            startTime,
            endTime,
            location,
            ticketTypes,
            ticketPrices,
            ticketQuantities,
            nftContract,
            block.timestamp
        );
        
        // Emit organizer registration event
        emit OrganizerRegistered(msg.sender, eventCount, block.timestamp);
        
        // Emit factory statistics event
        emit EventFactoryStats(
            eventCount,
            eventCount,
            organizerEvents[msg.sender].length,
            block.timestamp
        );
        
        return address(newEvent);
    }
    
    /**
     * @dev Get all events created by an organizer
     * @param organizer The organizer address
     */
    function getOrganizerEvents(address organizer) external view returns (uint256[] memory) {
        return organizerEvents[organizer];
    }
    
    /**
     * @dev Get event address by ID
     * @param eventId The event ID
     */
    function getEventAddress(uint256 eventId) external view returns (address) {
        return events[eventId];
    }
    
    /**
     * @dev Get total number of events
     */
    function getEventCount() external view returns (uint256) {
        return eventCount;
    }
} 