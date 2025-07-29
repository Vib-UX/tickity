// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/TickityNFT.sol";
import "../src/EventFactory.sol";
import "../src/TickityMarketplace.sol";
import "../src/TickityPOAP.sol";
import "../src/Event.sol";

/**
 * @title DeployWithPOAP
 * @dev Script to deploy all contracts with POAP integration
 */
contract DeployWithPOAP is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Starting Tickity Contract Deployment with POAP Integration...");
        console.log("===========================================================");

        // USDT contract address on Etherlink testnet
        address usdtContract = 0xf7f007dc8Cb507e25e8b7dbDa600c07FdCF9A75B;
        console.log("Using USDT contract at:", usdtContract);

        // Deploy TickityNFT contract
        TickityNFT nftContract = new TickityNFT();
        console.log("TickityNFT deployed at:", address(nftContract));

        // Deploy TickityPOAP contract
        TickityPOAP poapContract = new TickityPOAP();
        console.log("TickityPOAP deployed at:", address(poapContract));

        // Deploy EventFactory contract with POAP integration
        EventFactory factory = new EventFactory(usdtContract, address(poapContract));
        console.log("EventFactory deployed at:", address(factory));
        
        // Transfer ownership of NFT contract to EventFactory
        nftContract.transferOwnership(address(factory));
        console.log("NFT contract ownership transferred to EventFactory");
        
        // Deploy TickityMarketplace contract
        TickityMarketplace marketplace = new TickityMarketplace(address(nftContract), usdtContract);
        console.log("TickityMarketplace deployed at:", address(marketplace));

        console.log("");
        console.log("Creating Test Events with POAP Integration...");
        console.log("=============================================");

        // Create test events with POAP integration
        createTestEventsWithPOAP(factory, nftContract, poapContract);

        vm.stopBroadcast();
        
        console.log("");
        console.log("Deployment Complete with POAP Integration!");
        console.log("All contracts deployed and test events created with POAP integration.");
    }

    function createTestEventsWithPOAP(EventFactory factory, TickityNFT nftContract, TickityPOAP poapContract) internal {
        createMusicEventWithPOAP(factory, nftContract, poapContract);
        createTechEventWithPOAP(factory, nftContract, poapContract);
        createSportsEventWithPOAP(factory, nftContract, poapContract);
    }

    function createMusicEventWithPOAP(EventFactory factory, TickityNFT nftContract, TickityPOAP poapContract) internal {
        string[] memory ticketTypes = new string[](2);
        ticketTypes[0] = "VIP Pass";
        ticketTypes[1] = "General Admission";
        
        uint256[] memory prices = new uint256[](2);
        prices[0] = 3000000; // 3.0 USDT (6 decimals)
        prices[1] = 1500000; // 1.5 USDT (6 decimals)
        
        uint256[] memory quantities = new uint256[](2);
        quantities[0] = 100; // Limited VIP tickets
        quantities[1] = 0;   // Unlimited general tickets

        address eventAddress = factory.createEvent(
            "Etherlink Music Festival 2024 with POAP",
            "The biggest music festival on Etherlink with POAP integration!",
            block.timestamp + 30 days,
            block.timestamp + 30 days + 8 hours,
            "Etherlink Arena",
            ticketTypes,
            prices,
            quantities,
            address(nftContract)
        );

        console.log("Music Festival with POAP created at:", eventAddress);
        console.log("  - VIP Pass: 100 tickets @ 3.0 USDT");
        console.log("  - General Admission: Unlimited @ 1.5 USDT");
        console.log("  - POAP integration: Enabled");
    }

    function createTechEventWithPOAP(EventFactory factory, TickityNFT nftContract, TickityPOAP poapContract) internal {
        string[] memory ticketTypes = new string[](1);
        ticketTypes[0] = "Developer Pass";
        
        uint256[] memory prices = new uint256[](1);
        prices[0] = 2000000; // 2.0 USDT (6 decimals)
        
        uint256[] memory quantities = new uint256[](1);
        quantities[0] = 200; // Limited tickets

        address eventAddress = factory.createEvent(
            "Etherlink DevCon 2024 with POAP",
            "Join the most innovative developers with POAP proof of attendance!",
            block.timestamp + 15 days,
            block.timestamp + 15 days + 6 hours,
            "Etherlink Innovation Hub",
            ticketTypes,
            prices,
            quantities,
            address(nftContract)
        );

        console.log("Tech Conference with POAP created at:", eventAddress);
        console.log("  - Developer Pass: 200 tickets @ 2.0 USDT");
        console.log("  - POAP integration: Enabled");
    }

    function createSportsEventWithPOAP(EventFactory factory, TickityNFT nftContract, TickityPOAP poapContract) internal {
        string[] memory ticketTypes = new string[](1);
        ticketTypes[0] = "Championship Pass";
        
        uint256[] memory prices = new uint256[](1);
        prices[0] = 4000000; // 4.0 USDT (6 decimals)
        
        uint256[] memory quantities = new uint256[](1);
        quantities[0] = 0; // Unlimited tickets

        address eventAddress = factory.createEvent(
            "Etherlink Sports Championship 2024 with POAP",
            "Witness the ultimate sports championship with POAP collectibles!",
            block.timestamp + 45 days,
            block.timestamp + 45 days + 4 hours,
            "Etherlink Stadium",
            ticketTypes,
            prices,
            quantities,
            address(nftContract)
        );

        console.log("Sports Event with POAP created at:", eventAddress);
        console.log("  - Championship Pass: Unlimited @ 4.0 USDT");
        console.log("  - POAP integration: Enabled");
    }
} 