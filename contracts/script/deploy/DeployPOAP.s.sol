// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/EventFactory.sol";
import "../src/TickityNFT.sol";
import "../src/POAP.sol";
import "../src/IUSDT.sol";

/**
 * @title DeploySimplePOAP
 * @dev Deploy simplified contracts with simple POAP functionality
 */
contract DeploySimplePOAP is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying Simplified Contracts with Simple POAP");
        console.log("==============================================");
        console.log("");

        // Step 1: Deploy TickityNFT
        console.log("Step 1: Deploying TickityNFT...");
        TickityNFT nftContract = new TickityNFT();
        console.log("TickityNFT deployed at:", address(nftContract));
        console.log("");

        // Step 2: Deploy POAP
        console.log("Step 2: Deploying POAP...");
        POAP poapContract = new POAP();
        console.log("POAP deployed at:", address(poapContract));
        console.log("");

        // Step 3: Deploy EventFactory
        console.log("Step 3: Deploying EventFactory...");
        address USDT_CONTRACT = 0xf7f007dc8Cb507e25e8b7dbDa600c07FdCF9A75B;
        EventFactory factory = new EventFactory(
            USDT_CONTRACT,
            address(poapContract)
        );
        console.log("EventFactory deployed at:", address(factory));
        console.log("");

        // Step 4: Transfer NFT ownership to factory
        console.log("Step 4: Transferring NFT ownership to factory...");
        nftContract.transferOwnership(address(factory));
        console.log("NFT ownership transferred to factory");
        console.log("");

        // Step 5: Transfer POAP ownership to factory
        console.log("Step 5: Transferring POAP ownership to factory...");
        poapContract.transferOwnership(address(factory));
        console.log("POAP ownership transferred to factory");
        console.log("");

        vm.stopBroadcast();

        console.log("Deployment Complete!");
        console.log("===================");
        console.log("Contract Addresses:");
        console.log("- TickityNFT:", address(nftContract));
        console.log("- POAP:", address(poapContract));
        console.log("- EventFactory:", address(factory));
        console.log("");
        console.log("Features:");
        console.log("- POAP minting with URI from event contract");
        console.log("- No complex modifiers or restrictions");
        console.log("- Multiple POAPs per user per event enabled");
        console.log("- Clean ERC721 implementation");
        console.log("");
        console.log("Next: Create a real event and test POAP minting!");
    }
} 