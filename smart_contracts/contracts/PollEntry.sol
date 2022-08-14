// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

error NotOwner();
error ZeroOption();
error PollEnded();
error InvalidOptionIndex();
error AlreadyVoted();

contract PollEntry {
    address private immutable i_owner;
    string private s_title;
    string private s_description;
    string[] private s_options;
    // uint256[] private s_votes;
    mapping(uint256 => uint256) private s_votes;
    bool private s_is_poll_ended;

    // mapping of voter to option number (option number start with 1)
    mapping(address => uint256) private s_entries;

    modifier onlyOwner() {
        if (msg.sender != i_owner) revert NotOwner();
        _;
    }

    constructor(
        address owner,
        string memory title,
        string memory description,
        string[] memory options
    ) {
        if (options.length == 0) {
            revert ZeroOption();
        }
        i_owner = owner;
        s_title = title;
        s_description = description;
        s_options = options;
    }

    function vote(uint256 option_index) public {
        if (s_is_poll_ended) {
            revert PollEnded();
        }
        if (!(option_index >= 0 && option_index <= s_options.length)) {
            revert InvalidOptionIndex();
        }
        if (s_entries[msg.sender] != 0) {
            revert AlreadyVoted();
        }

        s_votes[option_index] += 1;
        s_entries[msg.sender] = option_index + 1;
    }

    function endPoll() public onlyOwner {
        s_is_poll_ended = true;
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getTitle() public view returns (string memory) {
        return s_title;
    }

    function getDescription() public view returns (string memory) {
        return s_description;
    }

    function getOptionsLength() public view returns (uint256) {
        return s_options.length;
    }

    function getOption(uint256 index) public view returns (string memory) {
        return s_options[index];
    }

    function getVotes(uint256 index) public view returns (uint256) {
        return s_votes[index];
    }

    function getEntry(address voterAddress) public view returns (uint256) {
        return s_entries[voterAddress];
    }

    function getIsPollEnded() public view returns (bool) {
        return s_is_poll_ended;
    }
}
