// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "./TickityNFT.sol";
import "./IUSDT.sol";

/**
 * @title TickityMarketplace
 * @dev Marketplace for secondary ticket sales
 */
contract TickityMarketplace is Ownable, ReentrancyGuard, ERC721Holder {
    // Structs
    struct Listing {
        address seller;
        uint256 tokenId;
        uint256 price;
        bool isActive;
        uint256 listedAt;
        uint256 expiresAt;
    }
    
    struct Offer {
        address bidder;
        uint256 amount;
        bool isActive;
        uint256 offeredAt;
        uint256 expiresAt;
    }
    
    // State variables
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => mapping(address => Offer)) public offers;
    mapping(uint256 => address[]) public offerAddresses;
    
    uint256 public platformFee = 250; // 2.5% (250 basis points)
    uint256 public listingFee = 1000000; // 1 USDT (6 decimals)
    uint256 public listingDuration = 7 days;
    uint256 public offerDuration = 3 days;
    
    address public nftContract;
    address public usdtContract;
    
    // Events
    event TicketListed(uint256 indexed tokenId, address indexed seller, uint256 price, uint256 expiresAt);
    event TicketSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event ListingCancelled(uint256 indexed tokenId, address indexed seller);
    event OfferMade(uint256 indexed tokenId, address indexed bidder, uint256 amount);
    event OfferAccepted(uint256 indexed tokenId, address indexed seller, address indexed bidder, uint256 amount);
    event OfferCancelled(uint256 indexed tokenId, address indexed bidder);
    
    // Modifiers
    modifier onlyTicketOwner(uint256 tokenId) {
        require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "Not ticket owner");
        _;
    }
    
    modifier listingExists(uint256 tokenId) {
        require(listings[tokenId].isActive, "Listing does not exist");
        _;
    }
    
    modifier listingNotExpired(uint256 tokenId) {
        require(listings[tokenId].expiresAt > block.timestamp, "Listing expired");
        _;
    }
    
    modifier offerExists(uint256 tokenId, address bidder) {
        require(offers[tokenId][bidder].isActive, "Offer does not exist");
        _;
    }
    
    modifier offerNotExpired(uint256 tokenId, address bidder) {
        require(offers[tokenId][bidder].expiresAt > block.timestamp, "Offer expired");
        _;
    }
    
    constructor(address _nftContract, address _usdtContract) Ownable(msg.sender) {
        nftContract = _nftContract;
        usdtContract = _usdtContract;
    }
    
    /**
     * @dev List a ticket for sale
     * @param tokenId The ticket token ID
     * @param price The sale price in USDT
     */
    function listTicket(uint256 tokenId, uint256 price) external nonReentrant onlyTicketOwner(tokenId) {
        require(price > 0, "Price must be greater than 0");
        require(!listings[tokenId].isActive, "Ticket already listed");
        
        // Transfer listing fee in USDT
        IUSDT usdt = IUSDT(usdtContract);
        require(usdt.transferFrom(msg.sender, address(this), listingFee), "USDT listing fee transfer failed");
        
        // Check if ticket is valid for resale
        TickityNFT nft = TickityNFT(nftContract);
        require(nft.isTicketValidForResale(tokenId), "Ticket not valid for resale");
        
        // Transfer ticket to marketplace
        IERC721(nftContract).safeTransferFrom(msg.sender, address(this), tokenId);
        
        listings[tokenId] = Listing({
            seller: msg.sender,
            tokenId: tokenId,
            price: price,
            isActive: true,
            listedAt: block.timestamp,
            expiresAt: block.timestamp + listingDuration
        });
        
        emit TicketListed(tokenId, msg.sender, price, block.timestamp + listingDuration);
    }
    
    /**
     * @dev Purchase a listed ticket with USDT
     * @param tokenId The ticket token ID
     */
    function purchaseTicket(uint256 tokenId) external nonReentrant listingExists(tokenId) listingNotExpired(tokenId) {
        Listing storage listing = listings[tokenId];
        require(msg.sender != listing.seller, "Cannot buy your own ticket");
        
        // Transfer USDT from buyer to this contract
        IUSDT usdt = IUSDT(usdtContract);
        require(usdt.transferFrom(msg.sender, address(this), listing.price), "USDT transfer failed");
        
        // Calculate fees
        uint256 platformFeeAmount = (listing.price * platformFee) / 10000;
        uint256 sellerAmount = listing.price - platformFeeAmount;
        
        // Transfer ticket to buyer
        IERC721(nftContract).safeTransferFrom(address(this), msg.sender, tokenId);
        
        // Transfer USDT funds
        require(usdt.transfer(owner(), platformFeeAmount), "Platform fee transfer failed");
        require(usdt.transfer(listing.seller, sellerAmount), "Seller transfer failed");
        
        // Clear listing
        delete listings[tokenId];
        
        emit TicketSold(tokenId, listing.seller, msg.sender, listing.price);
    }
    
    /**
     * @dev Cancel a listing
     * @param tokenId The ticket token ID
     */
    function cancelListing(uint256 tokenId) external nonReentrant listingExists(tokenId) {
        require(listings[tokenId].seller == msg.sender, "Not listing owner");
        
        // Return ticket to seller
        IERC721(nftContract).safeTransferFrom(address(this), msg.sender, tokenId);
        
        emit ListingCancelled(tokenId, msg.sender);
        delete listings[tokenId];
    }
    
    /**
     * @dev Make an offer on a ticket with USDT
     * @param tokenId The ticket token ID
     * @param amount The offer amount in USDT
     */
    function makeOffer(uint256 tokenId, uint256 amount) external nonReentrant {
        require(amount > 0, "Offer amount must be greater than 0");
        require(IERC721(nftContract).ownerOf(tokenId) != msg.sender, "Cannot offer on your own ticket");
        require(!offers[tokenId][msg.sender].isActive, "Offer already exists");
        
        // Transfer USDT from bidder to this contract
        IUSDT usdt = IUSDT(usdtContract);
        require(usdt.transferFrom(msg.sender, address(this), amount), "USDT transfer failed");
        
        offers[tokenId][msg.sender] = Offer({
            bidder: msg.sender,
            amount: amount,
            isActive: true,
            offeredAt: block.timestamp,
            expiresAt: block.timestamp + offerDuration
        });
        
        offerAddresses[tokenId].push(msg.sender);
        
        emit OfferMade(tokenId, msg.sender, amount);
    }
    
    /**
     * @dev Accept an offer
     * @param tokenId The ticket token ID
     * @param bidder The bidder address
     */
    function acceptOffer(uint256 tokenId, address bidder) external nonReentrant onlyTicketOwner(tokenId) offerExists(tokenId, bidder) offerNotExpired(tokenId, bidder) {
        Offer storage offer = offers[tokenId][bidder];
        
        // Calculate fees
        uint256 platformFeeAmount = (offer.amount * platformFee) / 10000;
        uint256 sellerAmount = offer.amount - platformFeeAmount;
        
        // Transfer ticket to bidder
        IERC721(nftContract).safeTransferFrom(msg.sender, bidder, tokenId);
        
        // Transfer USDT funds
        IUSDT usdt = IUSDT(usdtContract);
        require(usdt.transfer(owner(), platformFeeAmount), "Platform fee transfer failed");
        require(usdt.transfer(msg.sender, sellerAmount), "Seller transfer failed");
        
        // Clear offer
        delete offers[tokenId][bidder];
        _removeOfferAddress(tokenId, bidder);
        
        emit OfferAccepted(tokenId, msg.sender, bidder, offer.amount);
    }
    
    /**
     * @dev Cancel an offer
     * @param tokenId The ticket token ID
     */
    function cancelOffer(uint256 tokenId) external nonReentrant offerExists(tokenId, msg.sender) {
        Offer storage offer = offers[tokenId][msg.sender];
        
        // Return USDT funds to bidder
        IUSDT usdt = IUSDT(usdtContract);
        require(usdt.transfer(msg.sender, offer.amount), "USDT refund failed");
        
        delete offers[tokenId][msg.sender];
        _removeOfferAddress(tokenId, msg.sender);
        
        emit OfferCancelled(tokenId, msg.sender);
    }
    
    /**
     * @dev Get all offers for a ticket
     * @param tokenId The ticket token ID
     */
    function getOffers(uint256 tokenId) external view returns (address[] memory) {
        return offerAddresses[tokenId];
    }
    
    /**
     * @dev Get offer details
     * @param tokenId The ticket token ID
     * @param bidder The bidder address
     */
    function getOffer(uint256 tokenId, address bidder) external view returns (Offer memory) {
        return offers[tokenId][bidder];
    }
    
    /**
     * @dev Update platform fee (owner only)
     * @param newFee The new fee in basis points
     */
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee cannot exceed 10%");
        platformFee = newFee;
    }
    
    /**
     * @dev Update listing fee (owner only)
     * @param newFee The new listing fee
     */
    function updateListingFee(uint256 newFee) external onlyOwner {
        listingFee = newFee;
    }
    
    /**
     * @dev Update listing duration (owner only)
     * @param newDuration The new duration in seconds
     */
    function updateListingDuration(uint256 newDuration) external onlyOwner {
        listingDuration = newDuration;
    }
    
    /**
     * @dev Update offer duration (owner only)
     * @param newDuration The new duration in seconds
     */
    function updateOfferDuration(uint256 newDuration) external onlyOwner {
        offerDuration = newDuration;
    }
    
    /**
     * @dev Remove offer address from array
     * @param tokenId The ticket token ID
     * @param bidder The bidder address
     */
    function _removeOfferAddress(uint256 tokenId, address bidder) internal {
        address[] storage addresses = offerAddresses[tokenId];
        for (uint256 i = 0; i < addresses.length; i++) {
            if (addresses[i] == bidder) {
                addresses[i] = addresses[addresses.length - 1];
                addresses.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Withdraw accumulated USDT fees (owner only)
     */
    function withdrawFees() external onlyOwner {
        IUSDT usdt = IUSDT(usdtContract);
        uint256 balance = usdt.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        
        require(usdt.transfer(owner(), balance), "USDT withdrawal failed");
    }
    
    // Fallback function
    receive() external payable {
        revert("Use specific functions");
    }
} 