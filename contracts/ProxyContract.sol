// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract TransparentProxy is Ownable {
    address public implementation;
    address public admin;

    constructor(address _implementation, address _admin) Ownable(msg.sender) {
        implementation = _implementation;
        admin = _admin;
    }

    function changeImplementation(address _implementation) external onlyOwner {
        implementation = _implementation;
    }

    function changeAdmin(address _newAdmin) external onlyOwner {
        transferOwnership(_newAdmin);
        admin = _newAdmin;
    }

    fallback() external payable {
        address _impl = implementation;
        require(_impl != address(0));
        assembly {
            let ptr := mload(0x40)
            calldatacopy(ptr, 0, calldatasize())
            let result := delegatecall(gas(), _impl, ptr, calldatasize(), 0, 0)
            let size := returndatasize()
            returndatacopy(ptr, 0, size)
            switch result
            case 0 {
                revert(ptr, size)
            }
            default {
                return(ptr, size)
            }
        }
    }
}
