// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./PollEntry.sol";

contract Poll3 {
    event EntryCreated(address pollEntry, address owner);

    // mapping of owner => addresses of PollEntry.sol
    mapping(address => address[]) entries;
    // contract addresses of PollEntry.sol
    address[] private pollEntries;

    function createEntry(
        string memory title,
        string memory description,
        string[] memory options
    ) public returns (address) {
        PollEntry pollEntry = new PollEntry(msg.sender, title, description, options);
        entries[msg.sender].push(address(pollEntry));
        pollEntries.push(address(pollEntry));
        emit EntryCreated(address(pollEntry), msg.sender);
        return address(pollEntry);
    }

    function getEntry(address ownerAddress) public view returns (address[] memory) {
        return (entries[ownerAddress]);
    }

    function getPollEntry(uint256 index) public view returns (address) {
        return (pollEntries[index]);
    }

    function getPollEntriesLength() public view returns (uint256) {
        return (pollEntries.length);
    }
}
