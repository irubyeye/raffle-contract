// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

import "./RandomNumberConsumerV2.sol";

contract Raffle is Ownable {
    mapping(address => bool) public allowedTokens;

    mapping(address => address) public currencyOracle;

    mapping(uint256 => uint256) public rafflePot;

    mapping(uint256 => uint256) public rafflePotInWeth;

    mapping(uint256 => bool) public isRaffleInProcess;

    mapping(uint256 => Player[]) public rafflePlayers;

    mapping(address => uint256) public isPlayed;

    mapping(uint256 => uint256) public raffleWinnerNumber;

    mapping(uint256 => address) public raffleWinner;

    mapping(uint256 => bool) public isPotTransfered;

    mapping(address => mapping(uint256 => uint256)) public userPosInRaffle;

    uint256 public raffleId;

    uint256 public constant DECIMALS = 18;

    uint256 public constant RANDOM_MAX_RANGE = 999999999999999999;

    address private _weth;

    address public uniswapRouterAddress;

    RandomNumberConsumerV2 randomNumberConsumer;
    IUniswapV2Router02 private _router;

    struct Player {
        address playerAddress;
        uint256 playerBet;
        uint256 prevDepSum;
    }

    constructor(
        RandomNumberConsumerV2 _consumer,
        address _wethAddress,
        address _uniSwapRouter
    ) Ownable(msg.sender) {
        randomNumberConsumer = _consumer;
        _weth = _wethAddress;
        _router = IUniswapV2Router02(_uniSwapRouter);
        uniswapRouterAddress = _uniSwapRouter;
    }

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

    function getCurrencyExt(address _token) public view returns (int) {
        return getCurrency(_token);
    }

    function getRafflePlayers(
        uint256 _raffleId
    ) external view returns (Player[] memory) {
        return rafflePlayers[_raffleId];
    }

    function getBalanceInUsd(
        address _player,
        uint256 _raffleId
    ) public view returns (uint256) {
        return
            rafflePlayers[_raffleId][userPosInRaffle[_player][raffleId]]
                .playerBet;
    }

    function getTokenOracle(address _token) external view returns (address) {
        return currencyOracle[_token];
    }

    function getWinnerNumber() public view returns (uint256) {
        return raffleWinnerNumber[raffleId];
    }

    function getRandomNumber() public view returns (uint256) {
        // randomNumberConsumer.requestRandomWords();
        // return randomNumberConsumer.randomNumber();

        return
            uint256(
                keccak256(
                    abi.encodePacked(
                        blockhash(block.number - 1),
                        block.timestamp
                    )
                )
            );
    }

    function deposite(
        address _token,
        uint256 _amount,
        uint256 _raffleId
    ) internal onlyAllowedTokens(_token) {
        IERC20(_token).transferFrom(msg.sender, address(this), _amount);

        require(
            IERC20(_token).balanceOf(address(this)) >= _amount && _amount > 0,
            "Not enough balance!"
        );

        int256 currency = getCurrency(_token);

        uint256 usdAmount = uint256(currency) * _amount;

        address[] memory path = new address[](2);
        path[0] = _token;
        path[1] = _weth;

        IERC20(_token).approve(uniswapRouterAddress, _amount);

        uint256[] memory amountsOut = _router.getAmountsOut(_amount, path);

        uint256 amountInWeth = _router.swapExactTokensForTokens(
            _amount,
            amountsOut[amountsOut.length - 1],
            path,
            address(this),
            block.timestamp + 600
        )[amountsOut.length - 1];

        Player memory rafflePlayer;
        rafflePlayer.playerAddress = msg.sender;
        rafflePlayer.playerBet = usdAmount;
        rafflePlayer.prevDepSum = rafflePot[_raffleId];

        userPosInRaffle[msg.sender][_raffleId] = rafflePlayers[_raffleId]
            .length;

        rafflePlayers[_raffleId].push(rafflePlayer);

        rafflePot[_raffleId] += usdAmount;

        rafflePotInWeth[_raffleId] += amountInWeth;
    }

    function getLiquidity(
        address _tokenA,
        address _tokenB,
        uint256 _amount
    ) public view returns (uint256[] memory) {
        address[] memory path = new address[](2);
        path[0] = _tokenA;
        path[1] = _tokenB;

        return _router.getAmountsOut(_amount, path);
    }

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external {
        require(
            IERC20(tokenA).allowance(msg.sender, address(this)) >=
                amountADesired &&
                IERC20(tokenB).allowance(msg.sender, address(this)) >=
                amountBDesired,
            "Approval failed"
        );

        IERC20(tokenA).transferFrom(msg.sender, address(this), amountADesired);
        IERC20(tokenB).transferFrom(msg.sender, address(this), amountBDesired);

        IERC20(tokenA).approve(uniswapRouterAddress, amountADesired);
        IERC20(tokenB).approve(uniswapRouterAddress, amountBDesired);

        _router.addLiquidity(
            tokenA,
            tokenB,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin,
            to,
            deadline
        );
    }

    function playRaffle(address _token, uint256 _amount) external {
        if (!isRaffleInProcess[raffleId]) {
            // require(
            //     isPotTransfered[raffleId],
            //     "Cannot start new raffle before previous winner hasn't receive pot!"
            // );

            raffleId++;
            isRaffleInProcess[raffleId] = true;
        }

        require(isRaffleInProcess[raffleId], "This round has ended!");

        require(
            isPlayed[msg.sender] != raffleId,
            "You have already joined this round!"
        );

        deposite(_token, _amount, raffleId);

        isPlayed[msg.sender] = raffleId;
    }

    function endRaffle() external onlyOwner {
        raffleWinnerNumber[raffleId] =
            (getRandomNumber() % (10 ** DECIMALS)) +
            1;

        isRaffleInProcess[raffleId] = false;
    }

    function verifyAndTransfer(
        uint256 _raffleId,
        address _supposedWinner
    ) external onlyOwner {
        require(isPotTransfered[raffleId] == false, "Already transfered pot!");

        require(verifyWinner(_raffleId, _supposedWinner), "Wrong player!");

        isPotTransfered[_raffleId] = true;

        IERC20(_weth).transfer(_supposedWinner, rafflePotInWeth[_raffleId]);
    }

    function percCalc(
        uint256 _num1,
        uint256 _num2
    ) public pure returns (uint256) {
        uint256 movedDec = _num1 * 10 ** DECIMALS;
        return movedDec / _num2;
    }

    function calculateRange(
        uint256 _deposit,
        uint256 _totalBalance
    ) public view returns (uint256) {
        require(_totalBalance > 0, "Total balance must be greater than zero");

        uint256 depositPerc = percCalc(_deposit, _totalBalance);

        uint256 coef = RANDOM_MAX_RANGE;

        uint256 range = depositPerc * coef;

        return range / (10 ** DECIMALS);
    }

    function verifyWinner(
        uint256 _raffleId,
        address _supposedWinner
    ) public view returns (bool) {
        uint256 supposedWinnerRafflePos = userPosInRaffle[_supposedWinner][
            _raffleId
        ];

        Player memory supposedWinnerParams = rafflePlayers[_raffleId][
            supposedWinnerRafflePos
        ];

        require(
            supposedWinnerParams.playerAddress == _supposedWinner,
            "No such player in requested raffle!"
        );

        uint256 prevPlayersRange;

        if (supposedWinnerRafflePos == 0) {
            prevPlayersRange = 0;
        } else {
            prevPlayersRange = calculateRange(
                supposedWinnerParams.prevDepSum,
                rafflePot[_raffleId]
            );
        }

        uint256 currPlayerRange = calculateRange(
            supposedWinnerParams.playerBet,
            rafflePot[_raffleId]
        );

        uint256 maxPlayerDiapason = prevPlayersRange + currPlayerRange;

        uint256 checkedRaffleWinnerNumber = raffleWinnerNumber[_raffleId];

        if (
            checkedRaffleWinnerNumber > prevPlayersRange &&
            checkedRaffleWinnerNumber < maxPlayerDiapason
        ) {
            return true;
        } else {
            return false;
        }
    }
}
