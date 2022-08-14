const { frontEndContractsFile, frontEndAbiLocation } = require("../helper-hardhat-config")
require("dotenv").config()
const fs = require("fs")
const { network } = require("hardhat")

module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Writing to front end...")
        await updateContractAddresses()
        await updateAbi()
        console.log("Front end written!")
    }
}

async function updateAbi() {
    const poll3 = await ethers.getContract("Poll3")
    fs.writeFileSync(
        `${frontEndAbiLocation}Poll3.abi.json`,
        poll3.interface.format(ethers.utils.FormatTypes.json)
    )

    // const poll3File = JSON.parse(fs.readFileSync("./artifacts/contracts/Poll3.sol/Poll3.json"))
    // const poll3Abi = poll3File["abi"]
    // fs.writeFileSync(`${frontEndAbiLocation}Poll3.abi.json`, JSON.stringify(poll3Abi))

    const pollEntryFile = JSON.parse(
        fs.readFileSync("./artifacts/contracts/PollEntry.sol/PollEntry.json")
    )
    const pollEntryAbi = pollEntryFile["abi"]
    fs.writeFileSync(`${frontEndAbiLocation}PollEntry.abi.json`, JSON.stringify(pollEntryAbi))
}

async function updateContractAddresses() {
    const chainId = network.config.chainId.toString()
    const poll3 = await ethers.getContract("Poll3")
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))
    if (chainId in contractAddresses) {
        if (!contractAddresses[chainId]["Poll3"].includes(poll3.address)) {
            contractAddresses[chainId]["Poll3"].push(poll3.address)
        }
    } else {
        contractAddresses[chainId] = { Poll3: [poll3.address] }
    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))
}
module.exports.tags = ["all", "frontend"]
