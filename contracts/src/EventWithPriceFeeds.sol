// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@redstone-finance/evm-connector/dist/contracts/data-services/PrimaryProdDataServiceConsumerBase.sol";
import "./TickityNFT.sol";
import "./POAP.sol";
import "./IUSDT.sol";
import "forge-std/console.sol";

/**
 * @title EventWithPriceFeeds
 * @dev Individual event contract for managing ticket sales with RedStone production price feeds
 * Supports both USD (USDT) and XTZ payments using live price feeds
 */
contract EventWithPriceFeeds is Ownable, ReentrancyGuard, Pausable, PrimaryProdDataServiceConsumerBase {
    // State variables
    string public name;
    string public description;
    uint256 public startTime;
    uint256 public endTime;
    string public location;
    uint256 public soldTickets;
    
    string[] public ticketTypes;
    uint256[] public ticketPricesUSD; // Prices in USD (6 decimals)
    uint256[] public ticketQuantities;
    uint256[] public soldByType;
    
    address public nftContract;
    address public organizer;
    address public usdtContract;
    address public poapContract;
    
    bool public isActive;
    uint256 public eventId;
    
    // Payment configuration
    bool public acceptXTZ;
    bool public acceptUSD;
    
    // Mappings
    mapping(address => uint256[]) public userPurchases;
    mapping(uint256 => bool) public usedTickets;
    
    // Events
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
        uint256 soldByTypeCount,
        string paymentMethod
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
    
    event EventResumed(
        uint256 indexed eventId,
        address indexed organizer,
        uint256 resumedAt
    );
    
    event PaymentMethodUpdated(
        uint256 indexed eventId,
        bool acceptXTZ,
        bool acceptUSD,
        uint256 updatedAt
    );
    
    // Modifiers
    modifier onlyOrganizer() {
        require(msg.sender == organizer, "Only organizer can call this function");
        _;
    }
    
    modifier eventActive() {
        require(isActive, "Event is not active");
        _;
    }
    
    modifier eventNotStarted() {
        require(block.timestamp < startTime, "Event has already started");
        _;
    }
    
    /**
     * @dev Constructor
     */
    constructor(
        string memory _name,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime,
        string memory _location,
        string[] memory _ticketTypes,
        uint256[] memory _ticketPricesUSD,
        uint256[] memory _ticketQuantities,
        address _nftContract,
        address _organizer,
        address _usdtContract,
        address _poapContract,
        uint256 _eventId,
        bool _acceptXTZ,
        bool _acceptUSD
    ) Ownable(msg.sender) {
        require(_startTime > block.timestamp, "Start time must be in the future");
        require(_endTime > _startTime, "End time must be after start time");
        require(_ticketTypes.length == _ticketPricesUSD.length, "Arrays length mismatch");
        require(_ticketTypes.length == _ticketQuantities.length, "Arrays length mismatch");
        require(_acceptXTZ || _acceptUSD, "Must accept at least one payment method");
        
        name = _name;
        description = _description;
        startTime = _startTime;
        endTime = _endTime;
        location = _location;
        ticketTypes = _ticketTypes;
        ticketPricesUSD = _ticketPricesUSD;
        ticketQuantities = _ticketQuantities;
        nftContract = _nftContract;
        organizer = _organizer;
        usdtContract = _usdtContract;
        poapContract = _poapContract;
        eventId = _eventId;
        isActive = true;
        acceptXTZ = _acceptXTZ;
        acceptUSD = _acceptUSD;
        
        soldByType = new uint256[](_ticketTypes.length);
        
        emit EventCreated(
            eventId,
            address(this),
            organizer,
            name,
            description,
            startTime,
            endTime,
            location,
            0, // No total tickets limit for dynamic minting
            block.timestamp
        );
    }
    
    /**
     * @dev Purchase a ticket with USDT
     * @param ticketTypeIndex The index of the ticket type to purchase
     */
    function purchaseTicketWithUSD(uint256 ticketTypeIndex) external nonReentrant whenNotPaused eventActive {
        require(acceptUSD, "USD payments not accepted");
        require(ticketTypeIndex < ticketTypes.length, "Invalid ticket type");
        require(ticketQuantities[ticketTypeIndex] == 0 || soldByType[ticketTypeIndex] < ticketQuantities[ticketTypeIndex], "Ticket type sold out");
        
        uint256 ticketPriceUSD = ticketPricesUSD[ticketTypeIndex];
        
        // Transfer USDT from buyer to this contract
        IUSDT usdt = IUSDT(usdtContract);
        require(usdt.transferFrom(msg.sender, address(this), ticketPriceUSD), "USDT transfer failed");
        
        _processTicketPurchase(ticketTypeIndex, ticketPriceUSD, "USD");
    }
    
    /**
     * @dev Purchase a ticket with XTZ using RedStone price feed
     * @param ticketTypeIndex The index of the ticket type to purchase
     */
    function purchaseTicketWithXTZ(uint256 ticketTypeIndex) external payable nonReentrant whenNotPaused eventActive {
        require(acceptXTZ, "XTZ payments not accepted");
        require(ticketTypeIndex < ticketTypes.length, "Invalid ticket type");
        require(ticketQuantities[ticketTypeIndex] == 0 || soldByType[ticketTypeIndex] < ticketQuantities[ticketTypeIndex], "Ticket type sold out");
        require(msg.value > 0, "Must send XTZ");
        
        uint256 ticketPriceUSD = ticketPricesUSD[ticketTypeIndex];
        
        // Get XTZ/USD price from RedStone oracle
        uint256 xtzPriceUSD = getOracleNumericValueFromTxMsg(bytes32("XTZ"));
        require(xtzPriceUSD > 0, "Invalid XTZ price");
        
        // Calculate required XTZ amount (convert USD price to XTZ)
        // ticketPriceUSD is in 6 decimals, xtzPriceUSD is in 8 decimals
        // We need to convert: (ticketPriceUSD * 1e8) / (xtzPriceUSD * 1e6)
        uint256 requiredXTZ = (ticketPriceUSD * 1e8) / (xtzPriceUSD * 1e6);
        
        require(msg.value >= requiredXTZ, "Insufficient XTZ sent");
        
        // Refund excess XTZ if any
        if (msg.value > requiredXTZ) {
            payable(msg.sender).transfer(msg.value - requiredXTZ);
        }
        
        _processTicketPurchase(ticketTypeIndex, ticketPriceUSD, "XTZ");
    }
    
    /**
     * @dev Internal function to process ticket purchase
     */
    function _processTicketPurchase(uint256 ticketTypeIndex, uint256 priceUSD, string memory paymentMethod) internal {
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
            priceUSD,
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
            priceUSD,
            ticketTypes[ticketTypeIndex],
            block.timestamp,
            0, // No remaining tickets limit for dynamic minting
            soldByType[ticketTypeIndex],
            paymentMethod
        );
    }
    
    /**
     * @dev Use a ticket for entry
     * @param tokenId The ticket token ID
     */
    function useTicket(uint256 tokenId) external {
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
     */
    function updateEvent(
        string memory _name,
        string memory _description,
        string memory _location
    ) external onlyOrganizer eventNotStarted {
        string memory oldName = name;
        string memory oldDescription = description;
        string memory oldLocation = location;
        
        name = _name;
        description = _description;
        location = _location;
        
        emit EventUpdated(
            eventId,
            organizer,
            oldName,
            _name,
            oldDescription,
            _description,
            oldLocation,
            _location,
            block.timestamp
        );
    }
    
    /**
     * @dev Pause the event (organizer only)
     */
    function pauseEvent() external onlyOrganizer {
        _pause();
        emit EventPaused(eventId, organizer, block.timestamp, "Event paused by organizer");
    }
    
    /**
     * @dev Resume the event (organizer only)
     */
    function resumeEvent() external onlyOrganizer {
        _unpause();
        emit EventResumed(eventId, organizer, block.timestamp);
    }
    
    /**
     * @dev Update payment methods (organizer only)
     */
    function updatePaymentMethods(bool _acceptXTZ, bool _acceptUSD) external onlyOrganizer {
        require(_acceptXTZ || _acceptUSD, "Must accept at least one payment method");
        acceptXTZ = _acceptXTZ;
        acceptUSD = _acceptUSD;
        
        emit PaymentMethodUpdated(eventId, _acceptXTZ, _acceptUSD, block.timestamp);
    }
    
    /**
     * @dev Withdraw USDT funds (organizer only)
     */
    function withdrawUSD() external onlyOrganizer {
        IUSDT usdt = IUSDT(usdtContract);
        uint256 balance = usdt.balanceOf(address(this));
        require(balance > 0, "No USDT to withdraw");
        
        require(usdt.transfer(organizer, balance), "USDT transfer failed");
    }
    
    /**
     * @dev Withdraw XTZ funds (organizer only)
     */
    function withdrawXTZ() external onlyOrganizer {
        uint256 balance = address(this).balance;
        require(balance > 0, "No XTZ to withdraw");
        
        payable(organizer).transfer(balance);
    }
    
    /**
     * @dev Get ticket price in XTZ using current RedStone price feed
     * @param ticketTypeIndex The index of the ticket type
     * @return priceInXTZ The price in XTZ (in wei)
     */
    function getTicketPriceInXTZ(uint256 ticketTypeIndex) external view returns (uint256 priceInXTZ) {
        require(ticketTypeIndex < ticketTypes.length, "Invalid ticket type");
        
        uint256 ticketPriceUSD = ticketPricesUSD[ticketTypeIndex];
        
        // Get XTZ/USD price from RedStone oracle
        uint256 xtzPriceUSD = getOracleNumericValueFromTxMsg(bytes32("XTZ"));
        require(xtzPriceUSD > 0, "Invalid XTZ price");
        
        // Calculate XTZ amount: (ticketPriceUSD * 1e8) / (xtzPriceUSD * 1e6)
        priceInXTZ = (ticketPriceUSD * 1e8) / (xtzPriceUSD * 1e6);
    }
    
    /**
     * @dev Get current XTZ/USD price from RedStone
     * @return price The current XTZ/USD price (8 decimals)
     */
    function getCurrentXTZPrice() external view returns (uint256 price) {
        price = getOracleNumericValueFromTxMsg(bytes32("XTZ"));
    }
    
    /**
     * @dev Get event details
     */
    function getEventDetails() external view returns (
        string memory _name,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime,
        string memory _location,
        uint256 _soldTickets,
        bool _isActive,
        bool _acceptXTZ,
        bool _acceptUSD
    ) {
        return (
            name,
            description,
            startTime,
            endTime,
            location,
            soldTickets,
            isActive,
            acceptXTZ,
            acceptUSD
        );
    }
    
    /**
     * @dev Get ticket type details
     */
    function getTicketTypeDetails(uint256 index) external view returns (
        string memory ticketType,
        uint256 priceUSD,
        uint256 quantity,
        uint256 sold
    ) {
        require(index < ticketTypes.length, "Invalid ticket type index");
        return (
            ticketTypes[index],
            ticketPricesUSD[index],
            ticketQuantities[index],
            soldByType[index]
        );
    }
    
    /**
     * @dev Get user's purchased tickets
     */
    function getUserTickets(address user) external view returns (uint256[] memory) {
        return userPurchases[user];
    }
    
    /**
     * @dev Check if ticket is used
     */
    function isTicketUsed(uint256 tokenId) external view returns (bool) {
        return usedTickets[tokenId];
    }
    
    /**
     * @dev Generate token URI for NFT
     */
    function _generateTokenURI(uint256 ticketTypeIndex) internal view returns (string memory) {
        return string(abi.encodePacked(
            '{"name":"', name, ' - ', ticketTypes[ticketTypeIndex], '",',
            '"description":"Ticket for ', name, ' - ', ticketTypes[ticketTypeIndex], '",',
            '"image":"https://example.com/ticket.png",',
            '"attributes":[',
            '{"trait_type":"Event","value":"', name, '"},',
            '{"trait_type":"Ticket Type","value":"', ticketTypes[ticketTypeIndex], '"},',
            '{"trait_type":"Price","value":"', _uint2str(ticketPricesUSD[ticketTypeIndex]), ' USD"},',
            '{"trait_type":"Event ID","value":"', _uint2str(eventId), '"},',
            '{"trait_type":"Location","value":"', location, '"}',
            ']}'
        ));
    }
    
    /**
     * @dev Generate POAP URI
     */
    function _generatePOAPURI(uint256 tokenId, string memory ticketTypeName) internal view returns (string memory) {
        return string(abi.encodePacked(
            '{"name":"POAP - ', name, '",',
            '"description":"Proof of Attendance Protocol for ', name, '",',
            '"image":"https://example.com/poap.png",',
            '"attributes":[',
            '{"trait_type":"Event","value":"', name, '"},',
            '{"trait_type":"Ticket Type","value":"', ticketTypeName, '"},',
            '{"trait_type":"Token ID","value":"', _uint2str(tokenId), '"}',
            ']}'
        ));
    }
    
    /**
     * @dev Convert uint to string
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
     * @dev Receive function - reject direct XTZ transfers
     */
    receive() external payable {
        revert("Use purchaseTicketWithXTZ function");
    }
} 