// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/TickityNFT.sol";
import "../src/TickityPOAP.sol";
import "../src/EventFactory.sol";
import "../src/TickityMarketplace.sol";
import "../src/IUSDT.sol";

contract DeployFixedContracts is Script {
    address constant USDT_CONTRACT = 0xf7f007dc8Cb507e25e8b7dbDa600c07FdCF9A75B;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("Deploying Fixed Contracts with tx.origin Debugging");
        console.log("=================================================");
        console.log("Using USDT contract at:", USDT_CONTRACT);
        
        // Deploy core contracts
        TickityNFT nftContract = new TickityNFT();
        console.log("TickityNFT deployed at:", address(nftContract));
        
        TickityPOAP poapContract = new TickityPOAP();
        console.log("TickityPOAP deployed at:", address(poapContract));
        
        EventFactory factory = new EventFactory(USDT_CONTRACT, address(poapContract));
        console.log("EventFactory deployed at:", address(factory));
        
        nftContract.transferOwnership(address(factory));
        console.log("NFT contract ownership transferred to EventFactory");
        
        TickityMarketplace marketplace = new TickityMarketplace(address(nftContract), USDT_CONTRACT);
        console.log("TickityMarketplace deployed at:", address(marketplace));
        
        console.log("");
        console.log("Creating Test Event with tx.origin Debugging");
        console.log("===========================================");
        
        // Create a test event
        createTestEventWithDebugging(factory, nftContract, poapContract);
        
        vm.stopBroadcast();
        
        console.log("");
        console.log("Fixed Contract Deployment Complete!");
        console.log("==================================");
        console.log("Key Changes:");
        console.log("- Added tx.origin debugging to understand user address issue");
        console.log("- Ready for testing with address debugging");
    }
    
    function createTestEventWithDebugging(
        EventFactory factory, 
        TickityNFT nftContract, 
        TickityPOAP poapContract
    ) internal {
        string[] memory ticketTypes = new string[](1);
        ticketTypes[0] = "Debug Test Ticket";
        
        uint256[] memory prices = new uint256[](1);
        prices[0] = 50000; // 0.05 USDT
        
        uint256[] memory quantities = new uint256[](1);
        quantities[0] = 5;
        
        address eventAddress = factory.createEvent(
            "Debug POAP Test Event",
            "Test event for debugging user address issue",
            block.timestamp + 1 hours,
            block.timestamp + 2 hours,
            "Debug Venue",
            ticketTypes,
            prices,
            quantities,
            address(nftContract)
        );
        
        console.log("Debug Test Event created at:", eventAddress);
        
        // Create POAP event
        uint256 poapEventId = poapContract.createPOAPEvent(
            1, // Event ID will be 1
            eventAddress,
            msg.sender,
            "Debug POAP Test",
            "POAP for debugging test event",
            "https://ipfs.io/ipfs/QmDebugTest",
            "https://etherlink.com/events/debug-test"
        );
        
        console.log("POAP Event created with ID:", poapEventId);
        console.log("Ready for debugging with tx.origin!");
    }
} 