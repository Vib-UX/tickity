// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/EventFactory.sol";
import "../src/TickityNFT.sol";
import "../src/TickityPOAP.sol";
import "../src/IUSDT.sol";

/**
 * @title DeployUpdatedContracts
 * @dev Deploy updated contracts with multiple POAPs feature
 */
contract DeployUpdatedContracts is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying Updated Contracts with Multiple POAPs Feature");
        console.log("======================================================");
        console.log("");

        // Step 1: Deploy TickityNFT
        console.log("Step 1: Deploying TickityNFT...");
        TickityNFT nftContract = new TickityNFT();
        console.log("TickityNFT deployed at:", address(nftContract));
        console.log("");

        // Step 2: Deploy TickityPOAP (with multiple POAPs feature)
        console.log("Step 2: Deploying TickityPOAP (Updated)...");
        TickityPOAP poapContract = new TickityPOAP();
        console.log("TickityPOAP deployed at:", address(poapContract));
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
        console.log("- TickityPOAP:", address(poapContract));
        console.log("- EventFactory:", address(factory));
        console.log("");
        console.log("Features:");
        console.log("- Multiple POAPs per user per event enabled");
        console.log("- No single POAP restriction");
        console.log("- getUserPOAPCountForEvent() function available");
        console.log("- hasUserClaimedPOAP() deprecated (always returns false)");
        console.log("");
        console.log("Next: Create a real event and test POAP minting!");
    }
} 