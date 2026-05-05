// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Immutable on-chain log of every Kitex agent decision. Indexed by Goldsky.
contract KitexAuditLog is Ownable {

    mapping(address => bool) public authorized;

    event LPPositionOpened(bytes32 indexed agentDID, address poolAddress, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 timestamp);
    event LPPositionClosed(bytes32 indexed agentDID, uint256 tokenId, uint256 feesCollected, uint256 timestamp);
    event LPPositionRebalanced(bytes32 indexed agentDID, int24 oldTickLower, int24 oldTickUpper, int24 newTickLower, int24 newTickUpper, uint256 timestamp);
    event ArbitrageExecuted(bytes32 indexed agentDID, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut, int256 profit, uint256 timestamp);
    event ArbitrageFailed(bytes32 indexed agentDID, string reason, uint256 timestamp);
    event HedgeIntentLogged(bytes32 indexed agentDID, int256 deltaExposure, string direction, uint256 timestamp);
    event ReputationUpdated(bytes32 indexed agentDID, uint256 oldScore, uint256 newScore, string reason, uint256 timestamp);

    modifier onlyAuthorized() {
        require(authorized[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    constructor() Ownable(msg.sender) {
        authorized[msg.sender] = true;
    }

    function setAuthorized(address caller, bool status) external onlyOwner {
        authorized[caller] = status;
    }

    // ─── Log Functions ────────────────────────────────────────────────────────

    function logLPOpen(
        bytes32 agentDID,
        address poolAddress,
        int24 tickLower,
        int24 tickUpper,
        uint128 liquidity
    ) external onlyAuthorized {
        emit LPPositionOpened(agentDID, poolAddress, tickLower, tickUpper, liquidity, block.timestamp);
    }

    function logLPClose(
        bytes32 agentDID,
        uint256 tokenId,
        uint256 feesCollected
    ) external onlyAuthorized {
        emit LPPositionClosed(agentDID, tokenId, feesCollected, block.timestamp);
    }

    function logLPRebalance(
        bytes32 agentDID,
        int24 oldTickLower,
        int24 oldTickUpper,
        int24 newTickLower,
        int24 newTickUpper
    ) external onlyAuthorized {
        emit LPPositionRebalanced(agentDID, oldTickLower, oldTickUpper, newTickLower, newTickUpper, block.timestamp);
    }

    function logArb(
        bytes32 agentDID,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        int256 profit
    ) external onlyAuthorized {
        emit ArbitrageExecuted(agentDID, tokenIn, tokenOut, amountIn, amountOut, profit, block.timestamp);
    }

    function logArbFailed(
        bytes32 agentDID,
        string calldata reason
    ) external onlyAuthorized {
        emit ArbitrageFailed(agentDID, reason, block.timestamp);
    }

    function logHedgeIntent(
        bytes32 agentDID,
        int256 deltaExposure,
        string calldata direction
    ) external onlyAuthorized {
        emit HedgeIntentLogged(agentDID, deltaExposure, direction, block.timestamp);
    }

    function logReputation(
        bytes32 agentDID,
        uint256 oldScore,
        uint256 newScore,
        string calldata reason
    ) external onlyAuthorized {
        emit ReputationUpdated(agentDID, oldScore, newScore, reason, block.timestamp);
    }
}
