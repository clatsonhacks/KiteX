// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @notice Treasury and reputation-weighted capital allocation engine for Kitex agents
contract CapitalRouter is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;

    struct AgentConfig {
        bytes32 passportDID;
        uint256 baseAllocationBps;
        uint256 currentAllocationBps;
        uint256 reputationScore;
        uint256 lastReputationUpdate;
        bool isActive;
    }

    uint256 public totalDeposited;
    uint256 public totalReputationWeight;

    mapping(bytes32 => AgentConfig) public agents;
    bytes32[] public agentDIDs;

    event CapitalDeposited(address indexed depositor, uint256 amount, uint256 timestamp);
    event CapitalWithdrawn(address indexed recipient, uint256 amount, uint256 timestamp);
    event AllocationUpdated(bytes32 indexed agentDID, uint256 oldBps, uint256 newBps, uint256 reputationScore, uint256 timestamp);
    event SessionKeyAuthorized(bytes32 indexed agentDID, address sessionKey, uint256 valueLimit, bytes4 functionSelector, uint256 timestamp);
    event AgentRegistered(bytes32 indexed agentDID, uint256 baseAllocationBps, uint256 timestamp);

    constructor(address _usdc) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
    }

    // ─── Agent Management ────────────────────────────────────────────────────

    function registerAgent(
        bytes32 agentDID,
        uint256 baseAllocationBps,
        uint256 initialReputation
    ) external onlyOwner {
        require(agents[agentDID].passportDID == bytes32(0), "Already registered");
        require(baseAllocationBps <= 10000, "Bps > 100%");

        agents[agentDID] = AgentConfig({
            passportDID: agentDID,
            baseAllocationBps: baseAllocationBps,
            currentAllocationBps: baseAllocationBps,
            reputationScore: initialReputation,
            lastReputationUpdate: block.timestamp,
            isActive: true
        });

        agentDIDs.push(agentDID);
        totalReputationWeight += initialReputation;

        emit AgentRegistered(agentDID, baseAllocationBps, block.timestamp);
    }

    // ─── Capital Management ───────────────────────────────────────────────────

    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        totalDeposited += amount;
        emit CapitalDeposited(msg.sender, amount, block.timestamp);
    }

    function withdraw(uint256 amount) external onlyOwner nonReentrant {
        require(amount <= usdc.balanceOf(address(this)), "Insufficient balance");
        totalDeposited -= amount;
        usdc.safeTransfer(msg.sender, amount);
        emit CapitalWithdrawn(msg.sender, amount, block.timestamp);
    }

    // ─── Reputation & Allocation ──────────────────────────────────────────────

    /// @notice Called by backend after PnL computation. Updates score and recomputes all allocations.
    function updateReputation(bytes32 agentDID, uint256 newScore) external onlyOwner {
        AgentConfig storage agent = agents[agentDID];
        require(agent.isActive, "Agent not active");

        totalReputationWeight = totalReputationWeight - agent.reputationScore + newScore;
        agent.reputationScore = newScore;
        agent.lastReputationUpdate = block.timestamp;

        _recomputeAllocations();
    }

    function _recomputeAllocations() internal {
        if (totalReputationWeight == 0) return;
        for (uint256 i = 0; i < agentDIDs.length; i++) {
            AgentConfig storage agent = agents[agentDIDs[i]];
            if (!agent.isActive) continue;
            uint256 oldBps = agent.currentAllocationBps;
            uint256 newBps = (agent.reputationScore * 10000) / totalReputationWeight;
            agent.currentAllocationBps = newBps;
            emit AllocationUpdated(agentDIDs[i], oldBps, newBps, agent.reputationScore, block.timestamp);
        }
    }

    // ─── Session Keys ─────────────────────────────────────────────────────────

    /// @notice Emits the valueLimit for this agent so the backend can call addSessionKeyRule on Kite AA
    function authorizeSessionKey(
        bytes32 agentDID,
        address sessionKey,
        bytes4 selector
    ) external onlyOwner {
        AgentConfig storage agent = agents[agentDID];
        require(agent.isActive, "Agent not active");
        uint256 valueLimit = getAllocation(agentDID);
        emit SessionKeyAuthorized(agentDID, sessionKey, valueLimit, selector, block.timestamp);
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    function getAllocation(bytes32 agentDID) public view returns (uint256) {
        AgentConfig storage agent = agents[agentDID];
        if (!agent.isActive || totalReputationWeight == 0) return 0;
        return (usdc.balanceOf(address(this)) * agent.reputationScore) / totalReputationWeight;
    }

    function getAgentConfig(bytes32 agentDID) external view returns (AgentConfig memory) {
        return agents[agentDID];
    }

    function getAllAgentDIDs() external view returns (bytes32[] memory) {
        return agentDIDs;
    }

    function getTreasuryBalance() external view returns (uint256) {
        return usdc.balanceOf(address(this));
    }
}
