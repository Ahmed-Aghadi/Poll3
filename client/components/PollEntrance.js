import { contractAddresses, poll3Abi, pollEntryAbi } from "../constants"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
import { useNotification, Loading } from "@web3uikit/core"
import PollEntry from "./PollEntry"

export default function PollEntrance() {
    const [pollEntriesLength, setPollEntriesLength] = useState(0)

    const [pollEntries, setPollEntries] = useState([])
    const [hasStartedFetching, setHadStartedFetching] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const poll3Address =
        chainId in contractAddresses ? contractAddresses[chainId]["Poll3"][0] : null

    const dispatch = useNotification()
    const { runContractFunction } = useWeb3Contract()

    const {
        runContractFunction: getPollEntriesLength,
        data: pollEntriesLengthTxResponse,
        isLoading: isLoadingLength,
        isFetching: isFetchingLength,
    } = useWeb3Contract({
        abi: poll3Abi,
        contractAddress: poll3Address,
        functionName: "getPollEntriesLength",
        params: {},
    })

    async function updateUIValues() {
        const pollEntriesLengthFromCall = (await getPollEntriesLength()).toString()
        setPollEntriesLength(pollEntriesLengthFromCall)
        for (let i = 0; i < pollEntriesLengthFromCall; i++) {
            console.log("i")
            console.log(i)

            /* View Functions */

            let listOptions = {
                abi: poll3Abi,
                contractAddress: poll3Address,
                functionName: "getPollEntry",
                params: {
                    index: i,
                },
            }

            let pollEntrycontractAddress
            pollEntrycontractAddress = await runContractFunction({
                params: listOptions,
                onSuccess: (data) => {
                    console.log("data")
                    console.log(data)
                    pollEntrycontractAddress = data
                },
                onError: (error) => console.log(error),
            })
            console.log("pollEntrycontractAddress")

            /* View Functions */

            listOptions = {
                abi: pollEntryAbi,
                contractAddress: pollEntrycontractAddress,
                functionName: "getTitle",
                params: {},
            }

            let pollEntryTitle
            pollEntryTitle = await runContractFunction({
                params: listOptions,
                onSuccess: (data) => {
                    pollEntryTitle = data
                },
                onError: (error) => console.log(error),
            })

            /* View Functions */

            listOptions = {
                abi: pollEntryAbi,
                contractAddress: pollEntrycontractAddress,
                functionName: "getDescription",
                params: {},
            }

            let pollEntryDescription
            pollEntryDescription = await runContractFunction({
                params: listOptions,
                onSuccess: (data) => {
                    pollEntryDescription = data
                },
                onError: (error) => console.log(error),
            })

            const pollEntry = {
                contractAddress: pollEntrycontractAddress,
                title: pollEntryTitle,
                description: pollEntryDescription,
            }
            setPollEntries((oldPollEntries) => {
                console.log("pollEntry useState")
                console.log(pollEntry)
                return [...oldPollEntries, pollEntry]
            })
            console.log(pollEntries)
            setHadStartedFetching(true)
        }
        setHadStartedFetching(true)
        setIsLoading(false)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUIValues()
        }
    }, [isWeb3Enabled])

    const handleNewNotification = () => {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Transaction Notification",
            position: "topR",
            icon: "bell",
        })
    }

    // Probably could add some error handling
    const handleSuccess = async (tx) => {
        await tx.wait(1)
        updateUIValues()
        handleNewNotification(tx)
    }

    return (
        <div className="p-5 m-auto">
            <h1 className="py-4 px-4 text-center mb-5 font-bold text-5xl">Polls</h1>
            {!isLoading ? (
                <div className="grid grid-cols-1 text-center gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-5 lg:gap-8">
                    {pollEntries.map((pollEntry) => (
                        <PollEntry
                            key={pollEntry.contractAddress}
                            contractAddress={pollEntry.contractAddress}
                            title={pollEntry.title}
                            description={pollEntry.description}
                        />
                    ))}
                </div>
            ) : (
                <div
                    style={{
                        backgroundColor: "#ECECFE",
                        borderRadius: "8px",
                        padding: "20px",
                    }}
                >
                    <Loading
                        fontSize={12}
                        size={12}
                        spinnerColor="#2E7DAF"
                        spinnerType="wave"
                        text="Loading..."
                    />
                </div>
            )}
        </div>
    )
}
