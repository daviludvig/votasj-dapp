// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title VoterRegistry
/// @notice Registry of citizens eligible to vote in a São José/SC participatory budget cycle.
///         An off-chain gov.br relayer (operated by the City Hall multisig) calls `registerVoter`
///         after verifying CPF + residence. The on-chain contract never sees personal data —
///         only a salted hash of the credential returned by gov.br.
contract VoterRegistry {
    struct Voter {
        bool registered;
        bytes32 credentialHash;
        uint64 registeredAt;
    }

    address public admin;
    mapping(address => Voter) private voters;
    uint256 public totalVoters;

    event VoterRegistered(address indexed voter, bytes32 credentialHash);
    event VoterRevoked(address indexed voter, string reason);
    event AdminTransferred(address indexed previousAdmin, address indexed newAdmin);

    modifier onlyAdmin() {
        require(msg.sender == admin, "VoterRegistry: not admin");
        _;
    }

    constructor(address initialAdmin) {
        require(initialAdmin != address(0), "VoterRegistry: admin is zero");
        admin = initialAdmin;
    }

    function registerVoter(address voter, bytes32 credentialHash) external onlyAdmin {
        require(voter != address(0), "VoterRegistry: voter is zero");
        require(!voters[voter].registered, "VoterRegistry: already registered");
        require(credentialHash != bytes32(0), "VoterRegistry: empty credential");

        voters[voter] = Voter({
            registered: true,
            credentialHash: credentialHash,
            registeredAt: uint64(block.timestamp)
        });
        totalVoters += 1;

        emit VoterRegistered(voter, credentialHash);
    }

    function revokeVoter(address voter, string calldata reason) external onlyAdmin {
        require(voters[voter].registered, "VoterRegistry: not registered");
        delete voters[voter];
        totalVoters -= 1;
        emit VoterRevoked(voter, reason);
    }

    function isRegistered(address voter) external view returns (bool) {
        return voters[voter].registered;
    }

    function credentialOf(address voter) external view returns (bytes32) {
        return voters[voter].credentialHash;
    }

    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "VoterRegistry: admin is zero");
        emit AdminTransferred(admin, newAdmin);
        admin = newAdmin;
    }
}
