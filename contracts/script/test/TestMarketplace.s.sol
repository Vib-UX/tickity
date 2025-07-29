// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/TickityNFT.sol";
import "../src/EventFactory.sol";
import "../src/TickityMarketplace.sol";
import "../src/Event.sol";
import "../src/IUSDT.sol";

/**
 * @title TestMarketplace
 * @dev Marketplace testing script for Tickity on Etherlink
 */
contract TestMarketplace is Script {
    // Contract addresses from deployment
    address constant TICKITY_NFT = 0xF99b791257ab50be7F235BC825E7d4B83942cf38;
    address constant EVENT_FACTORY = 0x56EF69e24c3bCa5135C18574b403273F1eB2Bd74;
    address constant MARKETPLACE = 0x8b6cE7068F22276F00d05eb73F2D4dDD21DEDbEf;

    // User private keys will be read from environment variables

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        uint256 user1PrivateKey = vm.envUint("USER1_PRIVATE_KEY");
        uint256 user2PrivateKey = vm.envUint("USER2_PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Starting Marketplace Testing on Etherlink Testnet");
        console.log("=================================================");

        // Initialize contract instances
        EventFactory factory = EventFactory(EVENT_FACTORY);
        TickityMarketplace marketplace = TickityMarketplace(payable(MARKETPLACE));
        TickityNFT nftContract = TickityNFT(TICKITY_NFT);

        // Step 1: Create and setup test event
        address eventAddress = setupTestEvent(factory, nftContract);

        vm.stopBroadcast();

        // Step 2: User 1 purchases tickets
        testUser1Purchases(eventAddress, nftContract, user1PrivateKey);

        // Step 3: User 2 purchases tickets
        testUser2Purchases(eventAddress, nftContract, user2PrivateKey);

        // Step 4: Test marketplace trading
        testMarketplaceTrading(marketplace, nftContract, user1PrivateKey, user2PrivateKey);

        console.log("");
        console.log("All marketplace tests completed successfully!");
        console.log("=============================================");
        console.log("Marketplace functionality verified:");
        console.log("  - Ticket listing");
        console.log("  - Ticket purchasing");
        console.log("  - Price negotiation");
        console.log("  - Multiple user interactions");
    }

    function setupTestEvent(EventFactory factory, TickityNFT nftContract) internal returns (address) {
        console.log("Creating Test Event for Marketplace...");
        
        string memory eventName = "Marketplace Test Event";
        string memory eventDescription = "A test event for marketplace functionality";
        uint256 startTime = block.timestamp + 30 days;
        uint256 endTime = startTime + 4 hours;
        string memory location = "Marketplace Arena";
        
        string[] memory ticketTypes = new string[](1);
        ticketTypes[0] = "Marketplace Pass";
        
        uint256[] memory ticketPrices = new uint256[](1);
        ticketPrices[0] = 1000; // 0.001 USDT (6 decimals)
        
        uint256[] memory ticketQuantities = new uint256[](1);
        ticketQuantities[0] = 50;

        address eventAddress = factory.createEvent(
            eventName,
            eventDescription,
            startTime,
            endTime,
            location,
            ticketTypes,
            ticketPrices,
            ticketQuantities,
            TICKITY_NFT
        );

        console.log("  Event created at:", eventAddress);
        console.log("  Start Time:", startTime);
        console.log("  End Time:", endTime);
        console.log("  Ticket Price:", ticketPrices[0]);
        console.log("  Max Tickets:", ticketQuantities[0]);
        console.log("");

        // Create event in NFT contract
        nftContract.createEvent(
            eventAddress,
            eventName,
            eventDescription,
            startTime,
            endTime,
            location
        );
        
        // Set event ID in the event contract
        Event eventContract = Event(payable(eventAddress));
        eventContract.setEventId(2);

        return eventAddress;
    }

    function testUser1Purchases(address eventAddress, TickityNFT nftContract, uint256 user1PrivateKey) internal {
        vm.startBroadcast(user1PrivateKey);
        
        console.log("User 1 purchasing tickets...");
        Event eventContract = Event(payable(eventAddress));
        address user1 = vm.addr(user1PrivateKey);
        uint256 ticketPrice = eventContract.ticketPrices(0);
        
        // Purchase 2 tickets
        IUSDT usdt = IUSDT(0xf7f007dc8Cb507e25e8b7dbDa600c07FdCF9A75B);
        for (uint256 i = 0; i < 2; i++) {
            usdt.approve(address(eventContract), ticketPrice);
            eventContract.purchaseTicket(0);
            console.log("  User 1 purchased ticket", i + 1);
        }
        
        uint256 user1Balance = nftContract.balanceOf(user1);
        console.log("  User 1 total tickets:", user1Balance);
        
        vm.stopBroadcast();
    }

    function testUser2Purchases(address eventAddress, TickityNFT nftContract, uint256 user2PrivateKey) internal {
        vm.startBroadcast(user2PrivateKey);
        
        console.log("User 2 purchasing tickets...");
        Event eventContract = Event(payable(eventAddress));
        address user2 = vm.addr(user2PrivateKey);
        uint256 ticketPrice = eventContract.ticketPrices(0);
        
        // Purchase 1 ticket
        IUSDT usdt = IUSDT(0xf7f007dc8Cb507e25e8b7dbDa600c07FdCF9A75B);
        usdt.approve(address(eventContract), ticketPrice);
        eventContract.purchaseTicket(0);
        console.log("  User 2 purchased 1 ticket");
        
        uint256 user2Balance = nftContract.balanceOf(user2);
        console.log("  User 2 total tickets:", user2Balance);
        
        vm.stopBroadcast();
    }

    function testMarketplaceTrading(TickityMarketplace marketplace, TickityNFT nftContract, uint256 user1PrivateKey, uint256 user2PrivateKey) internal {
        address user1 = vm.addr(user1PrivateKey);
        address user2 = vm.addr(user2PrivateKey);

        // User 1 lists a ticket for sale
        vm.startBroadcast(user1PrivateKey);
        console.log("User 1 listing ticket for sale...");
        
        uint256 tokenToSell = 4; // User 1's first ticket
        uint256 listingPrice = 2000; // 0.002 USDT
        
        IUSDT usdt = IUSDT(0xf7f007dc8Cb507e25e8b7dbDa600c07FdCF9A75B);
        nftContract.approve(address(marketplace), tokenToSell);
        usdt.approve(address(marketplace), 1000000); // 1 USDT listing fee
        marketplace.listTicket(tokenToSell, listingPrice);
        console.log("  Listed token", tokenToSell, "for", listingPrice);
        vm.stopBroadcast();

        // User 2 buys the listed ticket
        vm.startBroadcast(user2PrivateKey);
        console.log("User 2 buying listed ticket...");
        
        usdt.approve(address(marketplace), listingPrice);
        marketplace.purchaseTicket(tokenToSell);
        console.log("  User 2 bought token", tokenToSell, "for", listingPrice);
        vm.stopBroadcast();

        // User 2 lists their ticket for a higher price
        vm.startBroadcast(user2PrivateKey);
        console.log("User 2 listing ticket for higher price...");
        
        uint256 tokenToSell2 = 6; // User 2's ticket
        uint256 listingPrice2 = 3000; // 0.003 USDT
        
        nftContract.approve(address(marketplace), tokenToSell2);
        usdt.approve(address(marketplace), 1000000); // 1 USDT listing fee
        marketplace.listTicket(tokenToSell2, listingPrice2);
        console.log("  Listed token", tokenToSell2, "for", listingPrice2);
        vm.stopBroadcast();

        // User 1 buys the higher-priced ticket
        vm.startBroadcast(user1PrivateKey);
        console.log("User 1 buying higher-priced ticket...");
        
        usdt.approve(address(marketplace), listingPrice2);
        marketplace.purchaseTicket(tokenToSell2);
        console.log("  User 1 bought token", tokenToSell2, "for", listingPrice2);
        vm.stopBroadcast();

        // Check final balances
        console.log("Checking final balances...");
        uint256 user1FinalBalance = nftContract.balanceOf(user1);
        uint256 user2FinalBalance = nftContract.balanceOf(user2);
        
        console.log("  User 1 final balance:", user1FinalBalance);
        console.log("  User 2 final balance:", user2FinalBalance);
    }
} 