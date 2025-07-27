// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDT is ERC20 {
    constructor() ERC20("Mock USDT", "USDT") {
        _mint(msg.sender, 1000000000000); // 1M USDT (6 decimals)
    }
    
    function decimals() public pure override returns (uint8) {
        return 6;
    }
} 