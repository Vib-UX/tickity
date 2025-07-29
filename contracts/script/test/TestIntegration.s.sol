// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/EventFactory.sol";
import "../src/Event.sol";
import "../src/TickityNFT.sol";
import "../src/TickityPOAP.sol";
import "../src/IUSDT.sol";

/**
 * @title TestPOAPIntegration
 * @dev Script to test POAP integration with a new event
 */
contract TestPOAPIntegration is Script {
    // Contract addresses from deployment
    address constant EVENT_FACTORY = 0x284b5002B62A74043C93D6fcD76B7F1c3954750d;
    address constant TICKITY_NFT = 0x701B9E0901c0c5F60296a59FAA20846efBbb5Ac1;
    address constant TICKITY_POAP = 0xB8e2fe6E7d34e669d019CAA5afA93faBdC37f92a;
    address constant USDT_CONTRACT = 0xf7f007dc8Cb507e25e8b7dbDa600c07FdCF9A75B;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Testing POAP Integration with New Event");
        console.log("======================================");
        console.log("");

        // Create EventFactory instance
        EventFactory factory = EventFactory(EVENT_FACTORY);
        
        // Create a new event that starts in 30 seconds
        string[] memory ticketTypes = new string[](1);
        ticketTypes[0] = "POAP Test Pass";
        
        uint256[] memory prices = new uint256[](1);
        prices[0] = 50000;  // 0.05 USDT (6 decimals)
        
        uint256[] memory quantities = new uint256[](1);
        quantities[0] = 5;  // Limited to 5 tickets

        address eventAddress = factory.createEvent(
            "POAP Integration Test Event",
            "Testing POAP integration with automatic minting",
            block.timestamp + 30 seconds,  // Start in 30 seconds
            block.timestamp + 30 seconds + 1 hours,  // End in 1 hour 30 seconds
            "Test Venue",
            ticketTypes,
            prices,
            quantities,
            TICKITY_NFT
        );

        console.log("POAP Integration Test Event created at:", eventAddress);
        console.log("Event starts in 30 seconds");
        console.log("Ticket price: 0.05 USDT");
        console.log("Limited to 5 tickets");
        console.log("");

        // Create POAP event for this new event
        console.log("Creating POAP Event for Integration Test...");
        TickityPOAP poapContract = TickityPOAP(TICKITY_POAP);
        
        uint256 poapEventId = poapContract.createPOAPEvent(
            4, // eventId (assuming this is the next event)
            eventAddress,
            msg.sender, // organizer
            "POAP Integration Test Event POAP",
            "Proof of attendance for the POAP integration test event",
            "https://ipfs.io/ipfs/QmPOAPIntegrationTestImage",
            "https://etherlink.com/events/poap-integration-test"
        );
        
        console.log("POAP Event created with ID:", poapEventId);
        console.log("");

        // Purchase a ticket immediately
        console.log("Purchasing ticket for POAP integration testing...");
        Event testEvent = Event(payable(eventAddress));
        
        // Approve USDT spending
        IUSDT usdt = IUSDT(USDT_CONTRACT);
        uint256 ticketPrice = testEvent.ticketPrices(0);
        usdt.approve(eventAddress, ticketPrice);
        
        // Purchase ticket
        testEvent.purchaseTicket(0);
        
        console.log("Ticket purchased successfully!");
        console.log("Ticket price:", ticketPrice, "USDT (6 decimals)");
        console.log("");

        vm.stopBroadcast();
        
        console.log("POAP Integration Test Setup Complete!");
        console.log("====================================");
        console.log("Event Address:", eventAddress);
        console.log("POAP Event ID:", poapEventId);
        console.log("Ticket Price: 0.05 USDT");
        console.log("");
        console.log("Next steps:");
        console.log("1. Wait 30 seconds for event to start");
        console.log("2. Run the UseTicketPOAP script to test POAP minting");
        console.log("3. Verify POAP was minted successfully");
        console.log("");
        console.log("Use this command to run the ticket usage script:");
        console.log("forge script script/UseTicketPOAP.s.sol --rpc-url https://node.ghostnet.etherlink.com --broadcast");
    }
} 