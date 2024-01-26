import { Raffle } from "./../typechain-types/contracts/Raffle";

type FixedPointNumber = bigint;

const DECIMALS: number = 18;
const RANDOM_MAX_RANGE: bigint = BigInt(999999999999999999);

function percCalc(_num1: bigint, _num2: bigint): FixedPointNumber {
  const movedDec: bigint = _num1 * 10n ** BigInt(DECIMALS);
  return movedDec / _num2;
}

function calculateRange(
  _deposit: bigint,
  _totalBalance: bigint
): FixedPointNumber {
  if (_totalBalance <= 0n) {
    throw new Error("Total balance must be greater than zero");
  }

  const depositPerc: FixedPointNumber = percCalc(_deposit, _totalBalance);
  const coef: FixedPointNumber = RANDOM_MAX_RANGE;

  const range: FixedPointNumber = depositPerc * coef;

  return range / BigInt(10n ** BigInt(DECIMALS)) - BigInt(1);
}

export default async function getProbableWinner(
  raffleContract: Raffle,
  raffleId: number
): Promise<string | undefined> {
  const players: Raffle.PlayerStructOutput[] =
    await raffleContract.getRafflePlayers(raffleId);

  const totalPot: bigint = await raffleContract.rafflePot(raffleId);
  const raffleWinningNumber: bigint = await raffleContract.raffleWinnerNumber(
    raffleId
  );

  for (let i = 0; i < players.length; i++) {
    let prevPlayersRange: bigint;

    if (i === 0) {
      prevPlayersRange = BigInt(0);
    } else {
      prevPlayersRange = calculateRange(players[i][2], totalPot);
    }

    const currentPlayerRange: bigint = calculateRange(players[i][1], totalPot);

    const maxPlayerDiapason = prevPlayersRange + currentPlayerRange;

    if (
      raffleWinningNumber > prevPlayersRange &&
      raffleWinningNumber < maxPlayerDiapason
    ) {
      return players[i][0];
    } else {
      continue;
    }
  }
  return undefined;
}
