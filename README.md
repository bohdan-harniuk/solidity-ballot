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

- Ensuring only the chairperson can give voting rights.
- Preventing already voted or delegated voters from receiving or delegating further.
- Validating vote counts and delegation logic.

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
