// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.7.0 <0.9.0;

contract Ballot {

    struct Voter {
        uint weight;// weight is accumulated by delegation
        bool voted;
        address delegate;
        uint vote;
    }

    struct Proposal {
        bytes32 name;
        uint voteCount;// number of accumulated votes
    }

    address public chairperson;

    mapping (address => Voter) public voters;
    Proposal[] public proposals;

    constructor(bytes32[] memory proposalNames) {
        chairperson = msg.sender;
        voters[chairperson].weight = 1;

        for (uint i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
    }

    function giveRightToVote(address[] calldata voters_) external {
        require(msg.sender == chairperson, "Only chairperson can give right to vote.");

        for (uint i = 0; i < voters_.length; i++) {
            require(!voters[voters_[i]].voted, "The voter already voted.");
            require(voters[voters_[i]].weight == 0, "Cannot give additional voting privileges.");
            voters[voters_[i]].weight = 1;
        }
    }

    function canVote(address who) external view returns (bool hasRights) {
        hasRights = voters[who].weight > 0 && !voters[who].voted;
    }

    function checkWeight(address voter) external view returns (uint weight) {
        require(msg.sender == chairperson, "Only the chairperson is authorized to verify the voting weight.");
        weight = voters[voter].weight;
    }

    function checkProposalVotes(uint proposal) external view returns (uint votes) {
        require(msg.sender == chairperson, "Only the chairperson has the authority to review individual proposal votes.");
        votes = proposals[proposal].voteCount;
    }

    function delegate(address to) external {
        Voter storage sender = voters[msg.sender];
        require(msg.sender != to, "Self-delegation is disallowed.");
        require(sender.weight != 0, "You have no right to vote.");
        require(!sender.voted, "You have already voted.");

        // Forward the delegation as long as
        // `to` also delegated.
        // In general, such loops are very dangerous,
        // because if they run too long, they might
        // need more gas than is available in a block.
        // In this case, the delegation will not be executed,
        // but in other situations, such loops might
        // cause a contract to get "stuck" completely.
        while (voters[to].delegate != address(0)) {
            to = voters[to].delegate;

            // We found a loop in the delegation, not allowed.
            require(to != msg.sender, "Found loop in delegation.");
        }

        Voter storage delegate_ = voters[to];
        require(delegate_.weight > 0, "You cannot delegate your vote to someone who doesn't have the right to vote.");

        sender.voted = true;
        sender.delegate = to;

        if (delegate_.voted) {
            // If the delegate already voted,
            // directly add to the number of votes
            proposals[delegate_.vote].voteCount += sender.weight;
        } else {
            // If the delegate did not vote yet,
            // add to her weight.
             delegate_.weight += sender.weight;
        }
        // sender.weight = 0;
    }

    function hasDelegatedTo(address to) external view returns (bool successfully) {
        successfully = voters[msg.sender].delegate == to;
    }

    function vote(uint proposal) external {
        Voter storage sender = voters[msg.sender];

        require(sender.weight > 0, "Has no right to vote.");
        require(!sender.voted, "Already voted.");

        sender.voted = true;
        sender.vote = proposal;

        // If `proposal` is out of the range of the array,
        // this will throw automatically and revert all
        // changes.
        proposals[proposal].voteCount += sender.weight;
    }

    function winningProposals() public view returns (uint[] memory) {
        uint winningVoteCount = 0;
        uint[] memory tmp = new uint[](proposals.length);
        uint length = 0;

        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                tmp = new uint[](proposals.length);
                length = 0;

                winningVoteCount = proposals[p].voteCount;
                tmp[length++] = p;
            } else if (proposals[p].voteCount == winningVoteCount) {
                tmp[length++] = p;
            }
        }
        uint[] memory winningProposals_ = new uint[](length);

        for (uint i = 0; i < length; i++) {
            winningProposals_[i] = tmp[i];
        }

        return winningProposals_;
    }

    function winnerNames() external view returns (bytes32[] memory) {
        uint[] memory winningProposals_ = winningProposals();
        bytes32[] memory winnerNames_ = new bytes32[](winningProposals_.length);

        for (uint i = 0; i < winningProposals_.length; i++) {
            winnerNames_[i] = proposals[winningProposals_[i]].name;
        }

        return winnerNames_;
    }
}
