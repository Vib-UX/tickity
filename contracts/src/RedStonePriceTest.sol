// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@redstone-finance/evm-connector/dist/contracts/data-services/PrimaryProdDataServiceConsumerBase.sol";
import "forge-std/console.sol";

/**
 * @title RedStonePriceTest
 * @dev Simple contract to test RedStone price feeds from production service
 */
contract RedStonePriceTest is PrimaryProdDataServiceConsumerBase {
    
    /**
     * @dev Get XTZ price from RedStone oracle
     * @return XTZ price in USD (8 decimals)
     */
    function getXTZPrice() public view returns (uint256) {
        return getOracleNumericValueFromTxMsg(bytes32("XTZ"));
    }
    
    /**
     * @dev Get ETH price from RedStone oracle
     * @return ETH price in USD (8 decimals)
     */
    function getETHPrice() public view returns (uint256) {
        return getOracleNumericValueFromTxMsg(bytes32("ETH"));
    }
    
    /**
     * @dev Get BTC price from RedStone oracle
     * @return BTC price in USD (8 decimals)
     */
    function getBTCPrice() public view returns (uint256) {
        return getOracleNumericValueFromTxMsg(bytes32("BTC"));
    }
    
    /**
     * @dev Get multiple prices at once
     * @return xtzPrice XTZ price in USD (8 decimals)
     * @return ethPrice ETH price in USD (8 decimals)
     * @return btcPrice BTC price in USD (8 decimals)
     */
    function getMultiplePrices() public view returns (uint256 xtzPrice, uint256 ethPrice, uint256 btcPrice) {
        xtzPrice = getOracleNumericValueFromTxMsg(bytes32("XTZ"));
        ethPrice = getOracleNumericValueFromTxMsg(bytes32("ETH"));
        btcPrice = getOracleNumericValueFromTxMsg(bytes32("BTC"));
    }
    
    /**
     * @dev Test function to log prices to console
     */
    function testPriceFeeds() public view {
        uint256 xtzPrice = getXTZPrice();
        uint256 ethPrice = getETHPrice();
        uint256 btcPrice = getBTCPrice();
        
        console.log("=== RedStone Production Price Feeds ===");
        console.log("XTZ Price (8 decimals):", xtzPrice);
        console.log("XTZ Price (USD):", xtzPrice / 1e8);
        console.log("ETH Price (8 decimals):", ethPrice);
        console.log("ETH Price (USD):", ethPrice / 1e8);
        console.log("BTC Price (8 decimals):", btcPrice);
        console.log("BTC Price (USD):", btcPrice / 1e8);
        console.log("=======================================");
    }
} 