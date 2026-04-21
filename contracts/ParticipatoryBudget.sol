// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {VoterRegistry} from "./VoterRegistry.sol";

/// @title ParticipatoryBudget
/// @notice Minimal participatory-budgeting voting contract for São José/SC.
///         MVP scope (PD1): one active cycle at a time, 1 vote per voter per cycle,
///         on-chain tally, IPFS CIDs for proposal metadata.
///         Identity privacy (zk) is out of scope for PD1 — addressed in PD2.
contract ParticipatoryBudget {
    enum CycleStatus { Pending, Open, Closed }

    struct Proposal {
        string ipfsCid;
        uint256 votes;
        address submitter;
        bool exists;
    }

    struct Cycle {
        uint64 opensAt;
        uint64 closesAt;
        uint256 budgetWei;
        CycleStatus status;
        uint256 proposalCount;
        uint256 totalVotes;
        uint256 winningProposalId;
    }

    VoterRegistry public immutable registry;
    address public admin;

    uint256 public currentCycleId;
    mapping(uint256 => Cycle) public cycles;
    mapping(uint256 => mapping(uint256 => Proposal)) private proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event CycleOpened(uint256 indexed cycleId, uint64 opensAt, uint64 closesAt, uint256 budgetWei);
    event ProposalSubmitted(uint256 indexed cycleId, uint256 indexed proposalId, address indexed submitter, string ipfsCid);
    event VoteCast(uint256 indexed cycleId, uint256 indexed proposalId, address indexed voter);
    event CycleClosed(uint256 indexed cycleId, uint256 winningProposalId, uint256 winningVotes);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Budget: not admin");
        _;
    }

    constructor(address registryAddress, address initialAdmin) {
        require(registryAddress != address(0), "Budget: registry is zero");
        require(initialAdmin != address(0), "Budget: admin is zero");
        registry = VoterRegistry(registryAddress);
        admin = initialAdmin;
    }

    function openCycle(uint64 opensAt, uint64 closesAt, uint256 budgetWei) external onlyAdmin returns (uint256) {
        require(opensAt < closesAt, "Budget: invalid window");
        require(closesAt > block.timestamp, "Budget: closes in past");
        require(
            currentCycleId == 0 || cycles[currentCycleId].status == CycleStatus.Closed,
            "Budget: cycle still active"
        );

        currentCycleId += 1;
        cycles[currentCycleId] = Cycle({
            opensAt: opensAt,
            closesAt: closesAt,
            budgetWei: budgetWei,
            status: CycleStatus.Open,
            proposalCount: 0,
            totalVotes: 0,
            winningProposalId: 0
        });

        emit CycleOpened(currentCycleId, opensAt, closesAt, budgetWei);
        return currentCycleId;
    }

    function submitProposal(string calldata ipfsCid) external returns (uint256) {
        Cycle storage cycle = cycles[currentCycleId];
        require(cycle.status == CycleStatus.Open, "Budget: cycle not open");
        require(block.timestamp < cycle.closesAt, "Budget: cycle ended");
        require(registry.isRegistered(msg.sender), "Budget: submitter not registered");
        require(bytes(ipfsCid).length > 0, "Budget: empty cid");

        cycle.proposalCount += 1;
        uint256 proposalId = cycle.proposalCount;
        proposals[currentCycleId][proposalId] = Proposal({
            ipfsCid: ipfsCid,
            votes: 0,
            submitter: msg.sender,
            exists: true
        });

        emit ProposalSubmitted(currentCycleId, proposalId, msg.sender, ipfsCid);
        return proposalId;
    }

    function vote(uint256 proposalId) external {
        Cycle storage cycle = cycles[currentCycleId];
        require(cycle.status == CycleStatus.Open, "Budget: cycle not open");
        require(block.timestamp >= cycle.opensAt, "Budget: cycle not started");
        require(block.timestamp < cycle.closesAt, "Budget: cycle ended");
        require(registry.isRegistered(msg.sender), "Budget: voter not registered");
        require(!hasVoted[currentCycleId][msg.sender], "Budget: already voted");

        Proposal storage proposal = proposals[currentCycleId][proposalId];
        require(proposal.exists, "Budget: unknown proposal");

        hasVoted[currentCycleId][msg.sender] = true;
        proposal.votes += 1;
        cycle.totalVotes += 1;

        emit VoteCast(currentCycleId, proposalId, msg.sender);
    }

    function closeCycle() external {
        Cycle storage cycle = cycles[currentCycleId];
        require(cycle.status == CycleStatus.Open, "Budget: cycle not open");
        require(block.timestamp >= cycle.closesAt, "Budget: cycle still running");

        uint256 winningId;
        uint256 winningVotes;
        for (uint256 i = 1; i <= cycle.proposalCount; i++) {
            uint256 v = proposals[currentCycleId][i].votes;
            if (v > winningVotes) {
                winningVotes = v;
                winningId = i;
            }
        }

        cycle.status = CycleStatus.Closed;
        cycle.winningProposalId = winningId;

        emit CycleClosed(currentCycleId, winningId, winningVotes);
    }

    function getProposal(uint256 cycleId, uint256 proposalId)
        external
        view
        returns (string memory ipfsCid, uint256 votes, address submitter)
    {
        Proposal storage p = proposals[cycleId][proposalId];
        require(p.exists, "Budget: unknown proposal");
        return (p.ipfsCid, p.votes, p.submitter);
    }
}
