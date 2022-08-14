const { ethers, network } = require("hardhat")
const { networkConfig } = require("../helper-hardhat-config")
require("dotenv").config()
// const { Blob } = require("buffer")

async function createEntry() {
    accounts = await ethers.getSigners()
    deployer = accounts[0]
    user = accounts[1]
    const chainId = network.config.chainId
    console.log("Chain ID : " + chainId)
    console.log("Creating Poll3 contract")
    const poll3Contract = await ethers.getContract("Poll3")
    console.log("Poll3 contract created")
    console.log("Connecting user to Poll3 contract")
    const poll3 = await poll3Contract.connect(user)
    console.log("User connected to Poll3 contract")
    const { title, description, options } = networkConfig[chainId]
    console.log("Title : " + title)
    console.log("Description : " + description)
    console.log("options : ")
    console.log(options)

    console.log("Creating entry")
    const tx = await poll3.createEntry(title, description, options)
    // console.log("----------------------------------")
    // console.log(tx)
    const response = await tx.wait()
    // console.log("----------------------------------")
    // console.log(response.logs[0].data)
    console.log("address of entry : " + response.events[0].data)
}

createEntry()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
