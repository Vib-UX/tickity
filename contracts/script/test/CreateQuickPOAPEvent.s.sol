// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../../src/EventFactory.sol";
import "../../src/Event.sol";
import "../../src/TickityNFT.sol";
import "../../src/POAP.sol";
import "../../src/IUSDT.sol";

/**
 * @title Create30SecPOAPEvent
 * @dev Script to create a 30-second event with POAP integration
 */
contract Create30SecPOAPEvent is Script {
    // New contract addresses from deployment with POAP integration
    address constant EVENT_FACTORY = 0x9f77a9e87436E9ab837Fc75D2E7dd8b81fDD1e1D;
    address constant TICKITY_NFT = 0xdD1c19B66931B73a33F970Bc30be5342C767447A;
    address constant TICKITY_POAP = 0x54AAc9DE386C8185Fe8842456E55d7bF17b1f8aB;
    address constant USDT_CONTRACT = 0xf7f007dc8Cb507e25e8b7dbDa600c07FdCF9A75B;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Creating 30-Second Event with POAP Integration");
        console.log("=============================================");
        console.log("");

        // Create EventFactory instance
        EventFactory factory = EventFactory(EVENT_FACTORY);
        
        // Create an event that starts in 30 seconds
        string[] memory ticketTypes = new string[](1);
        ticketTypes[0] = "POAP Test Pass";
        
        uint256[] memory prices = new uint256[](1);
        prices[0] = 50000;  // 0.05 USDT (6 decimals)
        
        uint256[] memory quantities = new uint256[](1);
        quantities[0] = 5;  // Limited to 5 tickets

        address eventAddress = factory.createEvent(
            "30-Second POAP Integration Test",
            "Testing POAP integration with automatic minting - starts in 30 seconds!",
            block.timestamp + 30 seconds,  // Start in 30 seconds
            block.timestamp + 30 seconds + 1 hours,  // End in 1 hour 30 seconds
            "Test Venue",
            ticketTypes,
            prices,
            quantities,
            TICKITY_NFT
        );

        console.log("30-Second POAP Event created at:", eventAddress);
        console.log("Event starts in 30 seconds");
        console.log("Ticket price: 0.05 USDT");
        console.log("Limited to 5 tickets");
        console.log("POAP integration: Enabled");
        console.log("");

        // Create POAP event for this new event
        console.log("Creating POAP Event for 30-Second Test...");
        POAP poapContract = POAP(TICKITY_POAP);
        
        uint256 poapEventId = poapContract.createPOAPEvent(
            4, // eventId (assuming this is the next event)
            eventAddress,
            msg.sender, // organizer
            "30-Second POAP Integration Test POAP",
            "Proof of attendance for the 30-second POAP integration test",
            "https://ipfs.io/ipfs/Qm30SecPOAPTestImage",
            "https://etherlink.com/events/30sec-poap-test"
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
        
        console.log("30-Second POAP Test Setup Complete!");
        console.log("===================================");
        console.log("Event Address:", eventAddress);
        console.log("POAP Event ID:", poapEventId);
        console.log("Ticket Price: 0.05 USDT");
        console.log("POAP Integration: Enabled");
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