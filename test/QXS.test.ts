import { ethers } from "hardhat";
import chai from "chai";
import { QXS__factory, QXS } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { BigNumber } from "ethers";

const { expect } = chai;

let qxs: QXS;
let qxsFactory: QXS__factory;
let deployer: SignerWithAddress;
let other: SignerWithAddress;

const PROXY_REGISTRATION_ADDRESS = "0xf57b2c51ded3a29e6891aba85459d600256cf317";
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

describe("qxs", () => {

    beforeEach(async () => {
        [deployer, other] = await ethers.getSigners();
        qxsFactory = (await ethers.getContractFactory(
            'QXS',
            deployer
        )) as QXS__factory;

        qxs = (await qxsFactory.deploy(PROXY_REGISTRATION_ADDRESS)) as QXS;
        expect(qxs.address).to.properAddress;
    });

    describe("deployment", async () => {
        it('deployer is owner', async () => {
            expect(await qxs.owner()).to.equal(deployer.address);
        });
    });

    describe("minting", async () => {
        it('deployer can mint tokens', async () => {
            const tokenId = ethers.BigNumber.from(1);

            await expect(qxs.connect(deployer).mintTo(other.address))
                .to.emit(qxs, 'Transfer')
                .withArgs(ZERO_ADDRESS, other.address, tokenId);

            expect(await qxs.balanceOf(other.address)).to.equal(1);
            expect(await qxs.ownerOf(tokenId)).to.equal(other.address);

            expect(await qxs.tokenURI(tokenId)).to.equal(await qxs.baseTokenURI() + tokenId.toString());
        });

        it('other accounts cannot mint tokens', async () => {
            await expect(qxs.connect(other).mintTo(other.address))
                .to.be.revertedWith('revert Ownable: caller is not the owner');
        });
    });
});

