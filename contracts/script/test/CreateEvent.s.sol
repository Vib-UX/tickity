// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/EventFactory.sol";
import "../src/Event.sol";
import "../src/TickityNFT.sol";
import "../src/TickityPOAP.sol";
import "../src/IUSDT.sol";

/**
 * @title Create30SecEvent
 * @dev Script to create an event that starts in 30 seconds for POAP testing
 */
contract Create30SecEvent is Script {
    // Contract addresses from deployment
    address constant EVENT_FACTORY = 0x284b5002B62A74043C93D6fcD76B7F1c3954750d;
    address constant TICKITY_NFT = 0x701B9E0901c0c5F60296a59FAA20846efBbb5Ac1;
    address constant TICKITY_POAP = 0xB8e2fe6E7d34e669d019CAA5afA93faBdC37f92a;
    address constant USDT_CONTRACT = 0xf7f007dc8Cb507e25e8b7dbDa600c07FdCF9A75B;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Creating 30-Second Event for POAP Testing");
        console.log("=========================================");
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
            "30-Second POAP Test Event",
            "A quick test event to demonstrate POAP functionality - starts in 30 seconds!",
            block.timestamp + 30 seconds,  // Start in 30 seconds
            block.timestamp + 30 seconds + 1 hours,  // End in 1 hour 30 seconds
            "Test Venue",
            ticketTypes,
            prices,
            quantities,
            TICKITY_NFT
        );

        console.log("30-Second Test Event created at:", eventAddress);
        console.log("Event starts in 30 seconds");
        console.log("Ticket price: 0.05 USDT");
        console.log("Limited to 5 tickets");
        console.log("");

        // Create POAP event for this new event
        console.log("Creating POAP Event for 30-Second Test...");
        TickityPOAP poapContract = TickityPOAP(TICKITY_POAP);
        
        uint256 poapEventId = poapContract.createPOAPEvent(
            3, // eventId (assuming this is the next event)
            eventAddress,
            msg.sender, // organizer
            "30-Second POAP Test Event POAP",
            "Proof of attendance for the 30-second POAP test event",
            "https://ipfs.io/ipfs/Qm30SecTestImage",
            "https://etherlink.com/events/30sec-test"
        );
        
        console.log("POAP Event created with ID:", poapEventId);
        console.log("");

        // Purchase a ticket immediately
        console.log("Purchasing ticket for testing...");
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
        
        console.log("30-Second Test Setup Complete!");
        console.log("==============================");
        console.log("Event Address:", eventAddress);
        console.log("POAP Event ID:", poapEventId);
        console.log("Ticket Price: 0.05 USDT");
        console.log("");
        console.log("Next steps:");
        console.log("1. Wait 30 seconds for event to start");
        console.log("2. Run the UseTicket script to test POAP minting");
        console.log("3. Verify POAP was minted successfully");
        console.log("");
        console.log("Use this command to run the ticket usage script:");
        console.log("forge script script/UseTicket.s.sol --rpc-url https://node.ghostnet.etherlink.com --broadcast");
    }
} 