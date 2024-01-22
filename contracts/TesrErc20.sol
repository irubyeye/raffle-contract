// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestErc20 is ERC20 {
    constructor(uint256 _initSupply) ERC20("TestToken", "TT") {
        _mint(msg.sender, _initSupply);
    }
}
