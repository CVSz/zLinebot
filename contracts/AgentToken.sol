// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AgentToken {
    mapping(address => uint256) public balance;
    mapping(address => uint256) public stake;

    event Transfer(address indexed from, address indexed to, uint256 amount);

    function mint(address to, uint256 amount) external {
        balance[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function stakeTokens(uint256 amount) external {
        require(balance[msg.sender] >= amount, "insufficient");
        balance[msg.sender] -= amount;
        stake[msg.sender] += amount;
    }

    function slash(address agent, uint256 amount) external {
        if (stake[agent] >= amount) {
            stake[agent] -= amount;
        }
    }
}
