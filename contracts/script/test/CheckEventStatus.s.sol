// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../../src/Event.sol";

contract CheckEventStatus is Script {
    // Contract addresses from latest deployment
    address constant EVENT_ADDRESS = 0x99e4a937A6Ea74a257399d05B9616f05cd817330;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        Event eventContract = Event(payable(EVENT_ADDRESS));

        // Check if the event contract exists and is accessible
        try eventContract.name() returns (string memory eventName) {
            console2.log("Event Name:", eventName);
        } catch {
            console2.log("ERROR: Could not read event name - contract may not exist");
            return;
        }

        try eventContract.description() returns (string memory description) {
            console2.log("Event Description:", description);
        } catch {
            console2.log("ERROR: Could not read event description");
        }

        try eventContract.location() returns (string memory location) {
            console2.log("Event Location:", location);
        } catch {
            console2.log("ERROR: Could not read event location");
        }

        try eventContract.startTime() returns (uint256 startTime) {
            console2.log("Event Start Time:", startTime);
        } catch {
            console2.log("ERROR: Could not read event start time");
        }

        try eventContract.endTime() returns (uint256 endTime) {
            console2.log("Event End Time:", endTime);
        } catch {
            console2.log("ERROR: Could not read event end time");
        }

        try eventContract.isActive() returns (bool isActive) {
            console2.log("Event Status:", isActive ? "Active" : "Inactive");
        } catch {
            console2.log("ERROR: Could not read event status");
        }

        try eventContract.eventId() returns (uint256 eventId) {
            console2.log("Event ID:", eventId);
        } catch {
            console2.log("ERROR: Could not read event ID");
        }

        try eventContract.organizer() returns (address organizer) {
            console2.log("Event Organizer:", organizer);
        } catch {
            console2.log("ERROR: Could not read event organizer");
        }

        try eventContract.nftContract() returns (address nftContract) {
            console2.log("NFT Contract:", nftContract);
        } catch {
            console2.log("ERROR: Could not read NFT contract address");
        }

        try eventContract.usdtContract() returns (address usdtContract) {
            console2.log("USDT Contract:", usdtContract);
        } catch {
            console2.log("ERROR: Could not read USDT contract address");
        }

        try eventContract.poapContract() returns (address poapContract) {
            console2.log("POAP Contract:", poapContract);
        } catch {
            console2.log("ERROR: Could not read POAP contract address");
        }

        vm.stopBroadcast();
    }
} 