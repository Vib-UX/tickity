// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/EventFactory.sol";
import "../src/TickityMarketplace.sol";
import "../src/TickityNFT.sol";

/**
 * @title TestEvents
 * @dev Testing script for creating events and testing Tickity functionality
 */
contract TestEvents is Script {
    // Deployed contract addresses
    address constant EVENT_FACTORY = 0x56EF69e24c3bCa5135C18574b403273F1eB2Bd74;
    address constant MARKETPLACE = 0x8b6cE7068F22276F00d05eb73F2D4dDD21DEDbEf;
    address constant TICKITY_NFT = 0xF99b791257ab50be7F235BC825E7d4B83942cf38;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Starting Tickity Event Testing on Etherlink Testnet");
        console.log("==================================================");
        console.log("Contract Addresses:");
        console.log("  EventFactory: 0xE5F8C19c223F1C4256E37B340b9aeec3695c6Ee5");
        console.log("  Marketplace: 0xB898d02f8e79B68a8Fe669f855A8097a4eD462a3");
        console.log("  TickityNFT: 0xe2462A45c2fa4494c60f4CCaB8b62D7e16276A8f");
        console.log("");

        // Create EventFactory instance
        EventFactory factory = EventFactory(0xE5F8C19c223F1C4256E37B340b9aeec3695c6Ee5);
        TickityNFT nftContract = TickityNFT(0xe2462A45c2fa4494c60f4CCaB8b62D7e16276A8f);
        TickityMarketplace marketplace = TickityMarketplace(payable(0xB898d02f8e79B68a8Fe669f855A8097a4eD462a3));

        console.log("Creating Music Concert Event...");
        createMusicConcert(factory);

        console.log("Creating Tech Conference Event...");
        createTechConference(factory);

        console.log("Creating Sports Event...");
        createSportsEvent(factory);

        vm.stopBroadcast();
        
        console.log("");
        console.log("All events created successfully!");
        console.log("You can now test ticket purchasing and marketplace functionality.");
    }

    function createMusicConcert(EventFactory factory) internal {
        string memory eventName = "Etherlink Music Festival";
        string memory eventDescription = "Experience the biggest music festival on Etherlink with top artists from around the world!";
        uint256 startTime = block.timestamp + 21 days;
        uint256 endTime = startTime + 12 hours;
        string memory location = "Etherlink Arena";
        
        string[] memory ticketTypes = new string[](1);
        ticketTypes[0] = "General Admission";
        
        uint256[] memory ticketPrices = new uint256[](1);
        ticketPrices[0] = 0.01 ether;
        
        uint256[] memory ticketQuantities = new uint256[](1);
        ticketQuantities[0] = 1000; // Limited to 1000 tickets

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

        // Register event in NFT contract
        TickityNFT nftContract = TickityNFT(TICKITY_NFT);
        nftContract.createEvent(
            eventAddress,
            eventName,
            eventDescription,
            startTime,
            endTime,
            location
        );

        console.log("  Music Concert created at:", eventAddress);
        console.log("  Start Time:", startTime);
        console.log("  End Time:", endTime);
        console.log("  Ticket Price:", ticketPrices[0]);
        console.log("  Max Tickets:", ticketQuantities[0]);
        console.log("");
    }

    function createTechConference(EventFactory factory) internal {
        string memory eventName = "Etherlink DevCon 2024";
        string memory eventDescription = "Join the most innovative developers and blockchain enthusiasts for a day of learning and networking!";
        uint256 startTime = block.timestamp + 14 days;
        uint256 endTime = startTime + 8 hours;
        string memory location = "Etherlink Innovation Hub";
        
        string[] memory ticketTypes = new string[](1);
        ticketTypes[0] = "Developer Pass";
        
        uint256[] memory ticketPrices = new uint256[](1);
        ticketPrices[0] = 0.005 ether;
        
        uint256[] memory ticketQuantities = new uint256[](1);
        ticketQuantities[0] = 500; // Limited to 500 tickets

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

        // Register event in NFT contract
        TickityNFT nftContract = TickityNFT(TICKITY_NFT);
        nftContract.createEvent(
            eventAddress,
            eventName,
            eventDescription,
            startTime,
            endTime,
            location
        );

        console.log("  Tech Conference created at:", eventAddress);
        console.log("  Start Time:", startTime);
        console.log("  End Time:", endTime);
        console.log("  Ticket Price:", ticketPrices[0]);
        console.log("  Max Tickets:", ticketQuantities[0]);
        console.log("");
    }

    function createSportsEvent(EventFactory factory) internal {
        string memory eventName = "Etherlink Championship Finals";
        string memory eventDescription = "Witness the most exciting sports championship in the metaverse!";
        uint256 startTime = block.timestamp + 7 days;
        uint256 endTime = startTime + 3 hours;
        string memory location = "Etherlink Stadium";
        
        string[] memory ticketTypes = new string[](1);
        ticketTypes[0] = "Championship Pass";
        
        uint256[] memory ticketPrices = new uint256[](1);
        ticketPrices[0] = 0.02 ether;
        
        uint256[] memory ticketQuantities = new uint256[](1);
        ticketQuantities[0] = 2000; // Limited to 2000 tickets

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

        // Register event in NFT contract
        TickityNFT nftContract = TickityNFT(TICKITY_NFT);
        nftContract.createEvent(
            eventAddress,
            eventName,
            eventDescription,
            startTime,
            endTime,
            location
        );

        console.log("  Sports Event created at:", eventAddress);
        console.log("  Start Time:", startTime);
        console.log("  End Time:", endTime);
        console.log("  Ticket Price:", ticketPrices[0]);
        console.log("  Max Tickets:", ticketQuantities[0]);
        console.log("");
    }

    function testMarketplace(TickityMarketplace marketplace, TickityNFT nftContract) internal {
        console.log("  Testing marketplace functionality...");
        
        // Note: Marketplace testing would require existing tickets
        // This is a placeholder for future testing when tickets are minted
        console.log("  Marketplace ready for ticket trading");
        console.log("  To test marketplace: mint tickets first, then list them");
        console.log("");
    }
} 