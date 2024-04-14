const { expect } = require('chai');
const { ethers } = require('hardhat');
const { loadFixture } = require('@nomicfoundation/hardhat-toolbox/network-helpers');

const toBytes32 = (text) => {
    return ethers.encodeBytes32String(text);
};

const fromBytes32 = (text) => {
    return ethers.decodeBytes32String(text);
};

describe('Ballot contract testing', () => {

    const proposals = [
        toBytes32('Matthew Yang'),
        toBytes32('Kennith Linford'),
        toBytes32('Emmett Celinda'),
        toBytes32('Logan Tilda'),
        toBytes32('Jesse Doreen'),
        toBytes32('Douglass Eppie')
    ];

    async function prepareBallotContract() {
        const accounts = await ethers.getSigners();
        const chairperson = accounts[0];
        const voters = accounts.slice(1);

        const Ballot = await ethers.getContractFactory("Ballot");
        const ballot = await Ballot.deploy(proposals);

        return { ballot, chairperson, voters }
    }

    describe('Giving a right to vote testing', () => {
        it('Allows giving a right to vote only for chairperson', async () => {
            const { ballot, voters } = await loadFixture(prepareBallotContract);
    
            await expect(
                ballot.connect(voters[0]).giveRightToVote(
                    voters.slice(1, 10)
                )
            ).to.be.revertedWith('Only chairperson can give right to vote.');
        });
    
        it('Those who have already voted cannot be granted additional voting rights', async () => {
            const { ballot, chairperson, voters } = await loadFixture(prepareBallotContract);
    
            await ballot.connect(chairperson).giveRightToVote([voters[0]]);
            await ballot.connect(voters[0]).vote(0);
    
            await expect(
                ballot.connect(chairperson).giveRightToVote(
                    [voters[0]]
                )
            ).to.be.revertedWith('The voter already voted.');
        });

        it('Those who have already been granted voting rights cannot receive additional voting privileges', async () => {
            const { ballot, chairperson, voters } = await loadFixture(prepareBallotContract);
    
            await ballot.connect(chairperson).giveRightToVote([voters[0]]);

            await expect(
                ballot.connect(chairperson).giveRightToVote(
                    [voters[0]]
                )
            ).to.be.revertedWith('Cannot give additional voting privileges.');
        });

        it('Voters can cast their votes once they have been granted voting privileges', async () => {
            const { ballot, chairperson, voters } = await loadFixture(prepareBallotContract);
            const testVoters = voters.slice(0, 5);

            await ballot.connect(chairperson).giveRightToVote(testVoters);

            for (let i = 0; i < testVoters.length; i++) {
                // eslint-disable-next-line no-unused-expressions
                expect(await ballot.connect(testVoters[i]).canVote(testVoters[i])).to.be.true;
            }
        });
    });

    describe('Delegating rights to vote testing', () => {
        it('Can delegate rights to vote', async () => {
            const { ballot, chairperson, voters } = await loadFixture(prepareBallotContract);
            const a = voters[0];
            const b = voters[1];

            await ballot.connect(chairperson).giveRightToVote([a, b]);
            await ballot.connect(a).delegate(b);

            // eslint-disable-next-line no-unused-expressions
            expect(await ballot.connect(chairperson).canVote(a)).to.be.false;
            // eslint-disable-next-line no-unused-expressions
            expect(await ballot.connect(chairperson).canVote(b)).to.be.true;
            // eslint-disable-next-line no-unused-expressions
            expect(await ballot.connect(a).hasDelegatedTo(b)).to.be.true;
        });

        it('Self-delegation is not allowed', async () => {
            const { ballot, chairperson, voters } = await loadFixture(prepareBallotContract);
            const a = voters[0];

            await ballot.connect(chairperson).giveRightToVote([a]);

            await expect(
                ballot.connect(a).delegate(a)
            ).to.be.revertedWith('Self-delegation is disallowed.');
        });

        it('Voting rights cannot be delegated if they are not granted in the first place', async () => {
            const { ballot, voters } = await loadFixture(prepareBallotContract);

            await expect(
                ballot.connect(voters[0]).delegate(voters[1])
            ).to.be.revertedWith('You have no right to vote.');
        });

        it('Self-delegation is not allowed', async () => {
            const { ballot, chairperson, voters } = await loadFixture(prepareBallotContract);
            const a = voters[0];
            const b = voters[1];

            await ballot.connect(chairperson).giveRightToVote([a, b]);
            await ballot.connect(a).vote(0);

            await expect(
                ballot.connect(a).delegate(b)
            ).to.be.revertedWith('You have already voted.');
        });

        it('Circular delegation is not allowed.', async () => {
            const { ballot, chairperson, voters } = await loadFixture(prepareBallotContract);
            const a = voters[0];
            const b = voters[1];
            const c = voters[2];

            await ballot.connect(chairperson).giveRightToVote([a, b, c]);
            await ballot.connect(a).delegate(b);
            await ballot.connect(b).delegate(c);

            await expect(
                ballot.connect(c).delegate(a)
            ).to.be.revertedWith('Found loop in delegation.');
        });

        it('Delegation is only possible to someone with voting privileges', async () => {
            const { ballot, chairperson, voters } = await loadFixture(prepareBallotContract);
            const a = voters[0];
            const b = voters[1];

            await ballot.connect(chairperson).giveRightToVote([a]);

            await expect(
                ballot.connect(a).delegate(b)
            ).to.be.revertedWith('You cannot delegate your vote to someone who doesn\'t have the right to vote.');
        });
    });

    describe("Voting testing", () => {
        it('Can vote', async () => {
            const { ballot, chairperson, voters } = await loadFixture(prepareBallotContract);
            const a = voters[0];
            const proposalNum = 0;

            await ballot.connect(chairperson).giveRightToVote([a]);
            const votesBefore = await ballot.connect(chairperson).checkProposalVotes(proposalNum);
            const voterWeight = await ballot.connect(chairperson).checkWeight(a);

            await ballot.connect(a).vote(proposalNum);

            expect(
                await ballot.connect(chairperson).checkProposalVotes(proposalNum)
            ).to.be.equal(votesBefore + voterWeight);
        });

        it('The voter can utilize all votes accumulated through delegation', async () => {
            const { ballot, chairperson, voters } = await loadFixture(prepareBallotContract);
            const a = voters[0];
            const b = voters[1];
            const c = voters[2];
            const d = voters[3];
            const voters_ = [a, b, c, d];
            const proposalNum = 0;

            const ballotWithChairperson = ballot.connect(chairperson);

            await ballotWithChairperson.giveRightToVote(voters_);
            const votesBefore = await ballotWithChairperson.checkProposalVotes(proposalNum);

            const expectedVotesCount = (await Promise.all(
                voters_.map(voter => ballotWithChairperson.checkWeight(voter))
            // eslint-disable-next-line no-undef
            )).reduce((total, weight) => total + BigInt(weight), BigInt(0)) + votesBefore;

            for (let i = 1; i < voters_.length; i++) {
                await ballot.connect(voters_[i]).delegate(voters_[0]);
            }

            await ballot.connect(a).vote(proposalNum);

            expect(
                await ballot.connect(chairperson).checkProposalVotes(proposalNum)
            ).to.be.equal(expectedVotesCount);
        });

        it('Voting is not allowed if no voting rights have been granted', async () => {
            const { ballot, voters } = await loadFixture(prepareBallotContract);
            const a = voters[0];

            await expect(
                ballot.connect(a).vote(0)
            ).to.be.revertedWith('Has no right to vote.');
        });

        it('Voting is not permitted if the individual has already cast their vote', async () => {
            const { ballot, chairperson, voters } = await loadFixture(prepareBallotContract);
            const a = voters[0];

            await ballot.connect(chairperson).giveRightToVote([a]);
            await ballot.connect(a).vote(0);

            await expect(
                ballot.connect(a).vote(1)
            ).to.be.revertedWith('Already voted.');
        });
    });

    describe('Voting results testing', () => {
        async function proceedWithVoting() {
            const { ballot, chairperson, voters } = await loadFixture(prepareBallotContract);
            await ballot.connect(chairperson).giveRightToVote(voters)
            let index = 0

            while (index < voters.length) {
                await ballot.connect(voters[index]).vote(index % proposals.length);
                index++;
            }

            return { ballot, chairperson, voters }
        }

        it('Check can get winner name', async () => {
            const { ballot, chairperson } = await loadFixture(proceedWithVoting);
            const winnerNames = (await ballot.connect(chairperson).winnerNames()).map((name) => fromBytes32(name) );

            expect(winnerNames).to.have.length.greaterThan(0);
        });

        it('Can get winner number', async () => {
            const { ballot, chairperson } = await loadFixture(proceedWithVoting);
            const winnerNums = await ballot.connect(chairperson).winningProposals();

            expect(winnerNums).to.have.length.greaterThan(0);
        });

        it('The winning numbers correspond to the names of the winners', async () => {
            const { ballot, chairperson } = await loadFixture(proceedWithVoting);
            const winnerNames = (await ballot.connect(chairperson).winnerNames()).map((name) => fromBytes32(name) );
            const winnerNums = await ballot.connect(chairperson).winningProposals();

            expect(winnerNames.length).to.equal(winnerNums.length);

            for (let i = 0; i < winnerNums.length; i++) {
                expect(
                    fromBytes32(proposals[i])
                ).to.equal(winnerNames[i]);
            }
        });
    });
});
