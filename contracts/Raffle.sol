// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Raffle is Ownable {
    mapping(address => bool) public allowedTokens;

    mapping(address => mapping(address => uint256)) public userBalanceInTok;

    mapping(address => address) public currencyOracle;

    mapping(address => uint256) public balancesUsd;

    constructor() Ownable(msg.sender) {}

    modifier onlyAllowedTokens(address _token) {
        require(allowedTokens[_token], "Token is not supported!");
        _;
    }

    function manageTokensList(
        address _token,
        bool _isAllowed
    ) external onlyOwner {
        allowedTokens[_token] = _isAllowed;
    }

    function manageCurrencyOracle(
        address _token,
        address _dataFeed
    ) external onlyOwner {
        currencyOracle[_token] = _dataFeed;
    }

    function getCurrency(
        address _token
    ) internal view onlyAllowedTokens(_token) returns (int) {
        AggregatorV3Interface localDataFeed = AggregatorV3Interface(
            currencyOracle[_token]
        );

        (, int answer, , , ) = localDataFeed.latestRoundData();
        return answer;
    }

    function getBalanceInUsd() external view returns (uint256) {
        return balancesUsd[msg.sender];
    }

    function getCurrencyExt(address _token) public view returns (int) {
        return getCurrency(_token);
    }

    function getTokenOracle(address _token) external view returns (address) {
        return currencyOracle[_token];
    }

    function deposite(
        address _token,
        uint256 _amount
    ) external onlyAllowedTokens(_token) {
        IERC20(_token).transferFrom(msg.sender, address(this), _amount);

        require(
            IERC20(_token).balanceOf(address(this)) >= _amount,
            "Not enough balance!"
        );

        userBalanceInTok[msg.sender][_token] += _amount;

        int256 currency = getCurrency(_token);

        balancesUsd[msg.sender] = uint256(currency) * _amount;
    }
}
