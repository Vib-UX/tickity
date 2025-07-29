// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/TickityNFT.sol";
import "../src/Event.sol";

/**
 * @title RegisterEvents
 * @dev Script to register existing events in the NFT contract
 */
contract RegisterEvents is Script {
    // Contract addresses from previous successful deployment
    address constant TICKITY_NFT = 0xF99b791257ab50be7F235BC825E7d4B83942cf38;
    
    // Event addresses from previous successful deployment
    address constant MUSIC_FESTIVAL = 0x2b57295EDC60Add58c1724fA465Fda553bD5e30B;
    address constant TECH_CONFERENCE = 0x034cB194d5424baF6B463974597eCef1dFe728e6;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Registering Events in NFT Contract");
        console.log("==================================");
        console.log("");

        TickityNFT nftContract = TickityNFT(TICKITY_NFT);

        // Register Music Festival
        console.log("Registering Music Festival...");
        Event musicEvent = Event(payable(MUSIC_FESTIVAL));
        
        string memory musicName = musicEvent.name();
        string memory musicDescription = musicEvent.description();
        uint256 musicStartTime = musicEvent.startTime();
        uint256 musicEndTime = musicEvent.endTime();
        string memory musicLocation = musicEvent.location();
        
        nftContract.createEvent(
            MUSIC_FESTIVAL,
            musicName,
            musicDescription,
            musicStartTime,
            musicEndTime,
            musicLocation
        );
        console.log("Music Festival registered successfully!");
        console.log("Event ID: 1");
        console.log("");

        // Register Tech Conference
        console.log("Registering Tech Conference...");
        Event techEvent = Event(payable(TECH_CONFERENCE));
        
        string memory techName = techEvent.name();
        string memory techDescription = techEvent.description();
        uint256 techStartTime = techEvent.startTime();
        uint256 techEndTime = techEvent.endTime();
        string memory techLocation = techEvent.location();
        
        nftContract.createEvent(
            TECH_CONFERENCE,
            techName,
            techDescription,
            techStartTime,
            techEndTime,
            techLocation
        );
        console.log("Tech Conference registered successfully!");
        console.log("Event ID: 2");
        console.log("");

        vm.stopBroadcast();
        
        console.log("All events registered successfully!");
        console.log("Now you can purchase tickets from these events.");
    }
} 