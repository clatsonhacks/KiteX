import { ethers } from "ethers";

// Algebra Integral uses Uniswap V3 compatible ABIs
const POOL_ABI = [
  "function globalState() external view returns (uint160 price, int24 tick, uint16 fee, uint16 timepointIndex, uint8 communityFeeToken0, uint8 communityFeeToken1, bool unlocked)",
  "function liquidity() external view returns (uint128)",
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
];

const POSITION_MANAGER_ABI = [
  "function positions(uint256 tokenId) external view returns (uint96 nonce, address operator, address token0, address token1, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
];

const FACTORY_ABI = [
  "function poolByPair(address tokenA, address tokenB) external view returns (address)",
];

export const ALGEBRA_ADDRESSES = {
  factory: "0x10253594A832f967994b44f33411940533302ACb",
  swapRouter: "0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A",
  positionManager: "0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C",
};

export const TOKENS = {
  USDC_E: "0x7aB6f3ed87C42eF0aDb67Ed95090f8bF5240149e",
  WKITE: "0xcc788DC0486CD2BaacFf287eea1902cc09FbA570",
};

export function getProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(process.env.KITE_RPC_URL || "https://rpc.gokite.ai/");
}

export async function getPoolState(poolAddress: string) {
  const provider = getProvider();
  const pool = new ethers.Contract(poolAddress, POOL_ABI, provider);

  const [globalState, liquidity, token0, token1] = await Promise.all([
    pool.globalState(),
    pool.liquidity(),
    pool.token0(),
    pool.token1(),
  ]);

  return {
    sqrtPriceX96: globalState.price as bigint,
    tick: Number(globalState.tick),
    fee: Number(globalState.fee),
    liquidity: liquidity as bigint,
    token0: token0 as string,
    token1: token1 as string,
  };
}

export async function getPosition(tokenId: bigint) {
  const provider = getProvider();
  const pm = new ethers.Contract(ALGEBRA_ADDRESSES.positionManager, POSITION_MANAGER_ABI, provider);
  const pos = await pm.positions(tokenId);

  return {
    token0: pos.token0 as string,
    token1: pos.token1 as string,
    tickLower: Number(pos.tickLower),
    tickUpper: Number(pos.tickUpper),
    liquidity: pos.liquidity as bigint,
    tokensOwed0: pos.tokensOwed0 as bigint,
    tokensOwed1: pos.tokensOwed1 as bigint,
  };
}

export async function getPositionsForOwner(ownerAddress: string): Promise<bigint[]> {
  const provider = getProvider();
  const pm = new ethers.Contract(ALGEBRA_ADDRESSES.positionManager, POSITION_MANAGER_ABI, provider);
  const count = await pm.balanceOf(ownerAddress);

  const tokenIds: bigint[] = [];
  for (let i = 0; i < Number(count); i++) {
    const tokenId = await pm.tokenOfOwnerByIndex(ownerAddress, i);
    tokenIds.push(tokenId);
  }
  return tokenIds;
}

export async function getPoolAddress(tokenA: string, tokenB: string): Promise<string> {
  const provider = getProvider();
  const factory = new ethers.Contract(ALGEBRA_ADDRESSES.factory, FACTORY_ABI, provider);
  return factory.poolByPair(tokenA, tokenB);
}

// Converts sqrtPriceX96 to a human-readable price
export function sqrtPriceX96ToPrice(
  sqrtPriceX96: bigint,
  token0Decimals: number,
  token1Decimals: number
): number {
  const Q96 = 2n ** 96n;
  const ratioX192 = sqrtPriceX96 * sqrtPriceX96;
  const price = Number(ratioX192) / Number(Q96 * Q96);
  return price * 10 ** (token0Decimals - token1Decimals);
}
