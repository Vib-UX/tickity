// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../../src/POAP.sol";
import "../../src/TickityNFT.sol";
import "../../src/EventFactoryWithPriceFeeds.sol";
import "../../src/EventWithPriceFeeds.sol";

contract DeployWithPriceFeeds is Script {
    // USDT contract address on Etherlink testnet
    address constant USDT_CONTRACT = 0xf7f007dc8Cb507e25e8b7dbDa600c07FdCF9A75B;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("=== Deploying Contracts with Price Feeds ===");
        console.log("Deployer:", deployer);
        console.log("Network: Etherlink Testnet");
        console.log("RedStone Service: Primary Production");
        console.log("USDT Contract:", USDT_CONTRACT);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy POAP contract
        console.log("\n--- Deploying POAP Contract ---");
        POAP poapContract = new POAP();
        console.log("POAP Contract:", address(poapContract));
        
        // Deploy NFT contract
        console.log("\n--- Deploying NFT Contract ---");
        TickityNFT nftContract = new TickityNFT();
        console.log("NFT Contract:", address(nftContract));
        
        // Deploy Factory with Price Feeds
        console.log("\n--- Deploying Factory with Price Feeds ---");
        EventFactoryWithPriceFeeds factory = new EventFactoryWithPriceFeeds(USDT_CONTRACT, address(poapContract));
        console.log("Factory Contract:", address(factory));
        
        // Transfer NFT contract ownership to factory
        nftContract.transferOwnership(address(factory));
        console.log("NFT ownership transferred to factory");
        
        vm.stopBroadcast();
        
        // Create sample events to test price feeds
        console.log("\n--- Creating Sample Events with Price Feeds ---");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Sample event data
        string[] memory techTicketTypes = new string[](2);
        techTicketTypes[0] = "VIP Pass";
        techTicketTypes[1] = "General Admission";
        
        uint256[] memory techPrices = new uint256[](2);
        techPrices[0] = 1000000; // 1.0 USDT (6 decimals)
        techPrices[1] = 500000;  // 0.5 USDT (6 decimals)
        
        uint256[] memory techQuantities = new uint256[](2);
        techQuantities[0] = 10; // 10 VIP tickets
        techQuantities[1] = 20; // 20 general admission tickets
        
        uint256 techStartTime = block.timestamp + 1 days;
        uint256 techEndTime = techStartTime + 2 hours;
        
        // Create event with both XTZ and USD payments
        (uint256 techEventId, address techEventAddress) = factory.createEventWithNFT(
            "Tech Conference 2024 with Price Feeds",
            "The biggest tech conference with live RedStone price feeds",
            techStartTime,
            techEndTime,
            "Virtual Event",
            techTicketTypes,
            techPrices,
            techQuantities,
            address(nftContract),
            true,  // accept XTZ
            true   // accept USD
        );
        
        console.log("Created Tech Event:");
        console.log("  Event ID:", techEventId);
        console.log("  Event Address:", techEventAddress);
        console.log("  Accepts XTZ: true");
        console.log("  Accepts USD: true");
        
        // Create event with XTZ only
        (uint256 xtzEventId, address xtzEventAddress) = factory.createEventWithNFT(
            "XTZ Only Event",
            "Event that only accepts XTZ payments with live price feeds",
            techStartTime + 1 days,
            techEndTime + 1 days,
            "XTZ Venue",
            techTicketTypes,
            techPrices,
            techQuantities,
            address(nftContract),
            true,   // accept XTZ
            false   // accept USD
        );
        
        console.log("Created XTZ Only Event:");
        console.log("  Event ID:", xtzEventId);
        console.log("  Event Address:", xtzEventAddress);
        console.log("  Accepts XTZ: true");
        console.log("  Accepts USD: false");
        
        // Create event with USD only
        (uint256 usdEventId, address usdEventAddress) = factory.createEventWithNFT(
            "USD Only Event",
            "Event that only accepts USD payments",
            techStartTime + 2 days,
            techEndTime + 2 days,
            "USD Venue",
            techTicketTypes,
            techPrices,
            techQuantities,
            address(nftContract),
            false,  // accept XTZ
            true    // accept USD
        );
        
        console.log("Created USD Only Event:");
        console.log("  Event ID:", usdEventId);
        console.log("  Event Address:", usdEventAddress);
        console.log("  Accepts XTZ: false");
        console.log("  Accepts USD: true");
        
        vm.stopBroadcast();
        
        console.log("\n=== Deployment Summary ===");
        console.log("POAP Contract:", address(poapContract));
        console.log("NFT Contract:", address(nftContract));
        console.log("Factory Contract:", address(factory));
        console.log("Tech Event:", techEventAddress);
        console.log("XTZ Only Event:", xtzEventAddress);
        console.log("USD Only Event:", usdEventAddress);
        
        console.log("\n=== Price Feed Functions Available ===");
        console.log("- getCurrentXTZPrice() - Get live XTZ/USD price");
        console.log("- getTicketPriceInXTZ(ticketTypeIndex) - Calculate ticket price in XTZ");
        console.log("- purchaseTicketWithXTZ(ticketTypeIndex) - Buy ticket with XTZ");
        console.log("- purchaseTicketWithUSD(ticketTypeIndex) - Buy ticket with USDT");
        
        console.log("\n=== RedStone Production Integration ===");
        console.log("All contracts now use PrimaryProdDataServiceConsumerBase");
        console.log("Live price feeds from RedStone production service");
        console.log("Supports XTZ, ETH, BTC and other price feeds");
        
        console.log("\n=== Deployment Complete ===");
        console.log("Contracts ready for production with live price feeds!");
    }
} 