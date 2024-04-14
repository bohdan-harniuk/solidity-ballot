# Solidity Ballot Application

This repository contains a Solidity project that simulates a simple voting mechanism. It is designed to demonstrate the usage of smart contracts for managing a ballot, where voters can vote on different proposals, delegate their votes, and retrieve voting results.

_This project is an extension of the **Solidity official documentation's Ballot** example application. It includes additional custom functions and comprehensive test coverage._

## Features

- **Smart Contract**: Implements a `Ballot` contract where proposals can be voted on by authorized voters.
- **Voting Rights**: Ability to give voting rights to different addresses which can then participate in the voting.
- **Delegation**: Voters can delegate their votes to other voters.
- **Vote Tracking**: Tracks votes for each proposal and can determine the winning proposal.

## Contract Structure

- **Ballot.sol**: Contains the main logic for the voting process, including functions for voting, delegating votes, and checking vote status.

### Functions

- `giveRightToVote`: Assign voting rights to addresses.
- `delegate`: Delegate voting rights to another address.
- `vote`: Vote on a proposal.
- `winningProposal`: Returns the proposal with the most votes.
- `winnerName`: Returns the name of the winning proposal.

## Testing

The `test` directory contains automated tests for the `Ballot` contract using the Hardhat framework.

### Test Scenarios

- **Giving Right to Vote**: Verifies that only the chairperson can give voting rights and that these rights cannot be assigned to those who have already voted or been granted rights before.
  - Tests ensure that a non-chairperson cannot give voting rights.
  - Checks that a voter who has already voted cannot be granted new voting rights.
  - Confirms that voters who have already been granted voting rights cannot receive them again.

- **Delegating Voting Rights**: Tests the ability of voters to delegate their voting rights to another voter and ensures that delegation logic is handled correctly.
  - Ensures that voters can delegate their rights to another eligible voter.
  - Confirms that self-delegation is disallowed.
  - Verifies that voters cannot delegate if they have already voted.
  - Checks for circular delegation to prevent infinite loops.
  - Ensures that a voter cannot delegate to another who has no right to vote.

- **Voting**: Assesses the functionality of casting votes, handling votes through delegation, and ensuring voters can only vote if they have the rights.
  - Tests that a voter can successfully cast a vote if they have the right.
  - Ensures that votes can accumulate correctly through delegation.
  - Checks that a voter without voting rights cannot vote.
  - Verifies that a voter cannot vote more than once.

- **Voting Results**: Evaluates the contract’s ability to compute the winning proposal based on the votes received.
  - Ensures that the contract can return the correct winner names and corresponding numbers.
  - Confirms that the count of winning proposal numbers matches the names of winners.
  - Validates the correspondence between winning proposal numbers and the correct proposal names.

These tests are critical for verifying the functional and security aspects of the Ballot contract, ensuring it behaves as expected under various scenarios.

## Getting Started

To run this project, you will need to install Node.js and Hardhat. Clone this repository and install its dependencies:

```bash
npm install
```

Compile the contracts:

```bash
npx hardhat compile
```

Run the tests to ensure everything is set up correctly:

```bash
npx hardhat test
```

## Contribution

Feel free to fork the repository, submit pull requests, or report issues on the GitHub issue tracker.
