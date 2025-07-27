// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/TickityNFT.sol";
import "../src/EventFactory.sol";
import "../src/TickityMarketplace.sol";
import "../src/Event.sol";

/**
 * @title Deploy
 * @dev Deployment script for Tickity contracts with automatic event registration
 */
contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Starting Tickity Contract Deployment...");
        console.log("=====================================");

        // USDT contract address on Etherlink testnet
        address usdtContract = 0xf7f007dc8Cb507e25e8b7dbDa600c07FdCF9A75B;
        console.log("Using USDT contract at:", usdtContract);

        // Deploy TickityNFT contract
        TickityNFT nftContract = new TickityNFT();
        console.log("TickityNFT deployed at:", address(nftContract));

        // Deploy EventFactory contract
        EventFactory factory = new EventFactory(usdtContract);
        console.log("EventFactory deployed at:", address(factory));
        
        // Transfer ownership of NFT contract to EventFactory
        nftContract.transferOwnership(address(factory));
        console.log("NFT contract ownership transferred to EventFactory");
        
        // Deploy TickityMarketplace contract
        TickityMarketplace marketplace = new TickityMarketplace(address(nftContract), usdtContract);
        console.log("TickityMarketplace deployed at:", address(marketplace));

        console.log("");
        console.log("Creating Test Events with NFT Registration...");
        console.log("=============================================");

        // Create test events and register them in NFT contract
        createTestEvents(factory, nftContract);

        vm.stopBroadcast();
        
        console.log("");
        console.log("Deployment Complete!");
        console.log("All contracts deployed and test events created with NFT registration.");
    }

    function createTestEvents(EventFactory factory, TickityNFT nftContract) internal {
        createMusicEvent(factory, nftContract);
        createTechEvent(factory, nftContract);
        createSportsEvent(factory, nftContract);
    }

    function createMusicEvent(EventFactory factory, TickityNFT nftContract) internal {
        string[] memory ticketTypes = new string[](2);
        ticketTypes[0] = "VIP Pass";
        ticketTypes[1] = "General Admission";
        
        uint256[] memory prices = new uint256[](2);
        prices[0] = 50000; // 0.05 USDT (6 decimals)
        prices[1] = 20000; // 0.02 USDT (6 decimals)
        
        uint256[] memory quantities = new uint256[](2);
        quantities[0] = 100; // Limited VIP tickets
        quantities[1] = 0;   // Unlimited general tickets

        address eventAddress = factory.createEvent(
            "Etherlink Music Festival 2024",
            "The biggest music festival on Etherlink with dynamic ticket minting!",
            block.timestamp + 30 days,
            block.timestamp + 30 days + 8 hours,
            "Etherlink Arena",
            ticketTypes,
            prices,
            quantities,
            address(nftContract)
        );

        console.log("Music Festival created at:", eventAddress);
        console.log("  - VIP Pass: 100 tickets @ 0.05 USDT");
        console.log("  - General Admission: Unlimited @ 0.02 USDT");
    }

    function createTechEvent(EventFactory factory, TickityNFT nftContract) internal {
        string[] memory ticketTypes = new string[](1);
        ticketTypes[0] = "Developer Pass";
        
        uint256[] memory prices = new uint256[](1);
        prices[0] = 10000; // 0.01 USDT (6 decimals)
        
        uint256[] memory quantities = new uint256[](1);
        quantities[0] = 200; // Limited tickets

        address eventAddress = factory.createEvent(
            "Etherlink DevCon 2024",
            "Join the most innovative developers and blockchain enthusiasts!",
            block.timestamp + 15 days,
            block.timestamp + 15 days + 6 hours,
            "Etherlink Innovation Hub",
            ticketTypes,
            prices,
            quantities,
            address(nftContract)
        );

        console.log("Tech Conference created at:", eventAddress);
        console.log("  - Developer Pass: 200 tickets @ 0.01 USDT");
    }

    function createSportsEvent(EventFactory factory, TickityNFT nftContract) internal {
        string[] memory ticketTypes = new string[](1);
        ticketTypes[0] = "Championship Pass";
        
        uint256[] memory prices = new uint256[](1);
        prices[0] = 30000; // 0.03 USDT (6 decimals)
        
        uint256[] memory quantities = new uint256[](1);
        quantities[0] = 0; // Unlimited tickets

        address eventAddress = factory.createEvent(
            "Etherlink Championship Finals",
            "Witness the most exciting sports championship with unlimited tickets!",
            block.timestamp + 7 days,
            block.timestamp + 7 days + 4 hours,
            "Etherlink Stadium",
            ticketTypes,
            prices,
            quantities,
            address(nftContract)
        );

        console.log("Sports Event created at:", eventAddress);
        console.log("  - Championship Pass: Unlimited @ 0.03 USDT");
    }
} 