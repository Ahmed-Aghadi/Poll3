import { contractAddresses, poll3Abi, pollEntryAbi } from "../constants"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
import { useNotification, Loading } from "@web3uikit/core"
import PollEntry from "../components/PollEntry"
import Header from "../components/Header"

export default function PollEntrance() {
    const [pollEntriesAddresses, setPollEntriesAddresses] = useState([])
    const [pollEntries, setPollEntries] = useState([])
    const [hasStartedFetching, setHadStartedFetching] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const { Moralis, isWeb3Enabled, account, chainId: chainIdHex } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const poll3Address =
        chainId in contractAddresses ? contractAddresses[chainId]["Poll3"][0] : null

    const dispatch = useNotification()
    const { runContractFunction } = useWeb3Contract()

    const {
        runContractFunction: getEntry,
        data: pollEntriesLengthTxResponse,
        isLoading: isLoadingLength,
        isFetching: isFetchingLength,
    } = useWeb3Contract({
        abi: poll3Abi,
        contractAddress: poll3Address,
        functionName: "getEntry",
        params: { ownerAddress: account },
    })

    async function updateUIValues() {
        console.log("starting...")
        console.log(account)
        const pollEntriesAddressesFromCall = await getEntry()
        console.log(pollEntriesAddressesFromCall)
        setPollEntriesAddresses(pollEntriesAddressesFromCall)
        for (let i = 0; i < pollEntriesAddressesFromCall.length; i++) {
            let pollEntrycontractAddress = pollEntriesAddressesFromCall[i]

            /* View Functions */

            let listOptions = {
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

    return (
        <div>
            <Header />
            <div className="p-5 m-auto">
                <h1 className="py-4 px-4 text-center mb-5 mt-5 font-bold text-5xl">My Polls</h1>
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
        </div>
    )
}
