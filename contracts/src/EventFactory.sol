// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Event.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title EventFactory
 * @dev Factory contract for creating and managing individual event contracts
 */
contract EventFactory is Ownable, ReentrancyGuard {
    constructor() Ownable(msg.sender) {}
    // State variables
    mapping(uint256 => address) public events;
    mapping(address => uint256[]) public organizerEvents;
    uint256 public eventCount;
    
    // Events with comprehensive details for subgraph
    event EventCreated(
        uint256 indexed eventId,
        address indexed eventAddress,
        address indexed organizer,
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
        require(startTime > block.timestamp, "Start time must be in the future");
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
            msg.sender
        );
        
        events[eventCount] = address(newEvent);
        organizerEvents[msg.sender].push(eventCount);
        
        // Set event ID in the new event contract
        newEvent.setEventId(eventCount);
        
        // Emit factory event creation event (Event contract will emit its own detailed event)
        emit EventCreated(
            eventCount,
            address(newEvent),
            msg.sender,
            block.timestamp
        );
        
        // Emit organizer registration event
        emit OrganizerRegistered(msg.sender, eventCount, block.timestamp);
        
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