// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../../src/EventFactory.sol";
import "../../src/POAP.sol";
import "../../src/Event.sol";
import "../../src/IUSDT.sol";

contract DeployFinalUpdatedContracts is Script {
    // Contract addresses from latest deployment
    address constant TICKITY_NFT = 0x39a450990A9A778172201f1CFC0e205E5D0B15d4;
    address constant USDT_CONTRACT = 0xf7f007dc8Cb507e25e8b7dbDa600c07FdCF9A75B; // USDT contract from event

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        console2.log("Deploying Final Updated Contracts (All Timestamp Checks Removed)...");
        console2.log("Deployer:", deployer);

        // Deploy new POAP contract
        POAP newPOAP = new POAP();
        console2.log("New POAP Contract deployed at:", address(newPOAP));

        // Deploy new EventFactory (with timestamp checks removed)
        EventFactory newFactory = new EventFactory(
            USDT_CONTRACT,
            address(newPOAP)
        );
        console2.log("New EventFactory deployed at:", address(newFactory));

        // Transfer POAP ownership to factory
        newPOAP.transferOwnership(address(newFactory));
        console2.log("POAP ownership transferred to factory");

        // Transfer NFT ownership to factory
        TickityNFT nft = TickityNFT(TICKITY_NFT);
        nft.transferOwnership(address(newFactory));
        console2.log("NFT ownership transferred to factory");

        console2.log("SUCCESS: Final updated contracts deployed successfully!");
        console2.log("New EventFactory:", address(newFactory));
        console2.log("New POAP Contract:", address(newPOAP));
        console2.log("ALL timestamp checks have been removed for easier testing");

        vm.stopBroadcast();
    }
} 