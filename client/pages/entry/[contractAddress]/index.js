import { useRouter } from "next/router"
import { ethers } from "ethers"
import { pollEntryAbi } from "../../../constants/index.js"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { Button, Tag, Loading, Information } from "@web3uikit/core"
import { useNotification } from "@web3uikit/core"
import { useEffect, useState } from "react"
import Header from "../../../components/Header.js"

export default function EntryDetail(props) {
    const { Moralis, isWeb3Enabled, chainId: chainIdHex, account } = useMoralis()
    const router = useRouter()
    const {
        title: titleFromQuery,
        description: descriptionFromQuery,
        contractAddress,
    } = router.query
    const [isLoading, setIsLoading] = useState(true)
    const [owner, setOwner] = useState()
    const [isPollEnded, setIsPollEnded] = useState(titleFromQuery)
    const [title, setTitle] = useState(titleFromQuery)
    const [description, setDescription] = useState(descriptionFromQuery)
    const [options, setOptions] = useState([])
    const [votes, setVotes] = useState([])
    const [checkedOption, setCheckedOption] = useState(-1)
    const [userVote, setUserVote] = useState(-1)
    const { runContractFunction } = useWeb3Contract()
    const dispatch = useNotification()

    useEffect(() => {
        if (isWeb3Enabled) {
            console.log("useEffect")
            updateUIValues()
        }
    }, [isWeb3Enabled])

    /* View Functions */

    const { runContractFunction: getIsPollEnded } = useWeb3Contract({
        abi: pollEntryAbi,
        contractAddress: contractAddress,
        functionName: "getIsPollEnded",
        params: {},
    })

    const { runContractFunction: getTitle } = useWeb3Contract({
        abi: pollEntryAbi,
        contractAddress: contractAddress,
        functionName: "getTitle",
        params: {},
    })

    const { runContractFunction: getDescription } = useWeb3Contract({
        abi: pollEntryAbi,
        contractAddress: contractAddress,
        functionName: "getDescription",
        params: {},
    })

    const { runContractFunction: getOptionsLength } = useWeb3Contract({
        abi: pollEntryAbi,
        contractAddress: contractAddress,
        functionName: "getOptionsLength",
        params: {},
    })

    const { runContractFunction: getEntry } = useWeb3Contract({
        abi: pollEntryAbi,
        contractAddress: contractAddress,
        functionName: "getEntry",
        params: { voterAddress: account },
    })

    const { runContractFunction: getOwner } = useWeb3Contract({
        abi: pollEntryAbi,
        contractAddress: contractAddress,
        functionName: "getOwner",
        params: {},
    })

    const { runContractFunction: endPoll } = useWeb3Contract({
        abi: pollEntryAbi,
        contractAddress: contractAddress,
        functionName: "endPoll",
        params: {},
    })

    const updateUIValues = async () => {
        const isPollEndedFromCall = await getIsPollEnded()
        setIsPollEnded(isPollEndedFromCall)
        console.log("isPollEnded")
        console.log(isPollEndedFromCall)
        console.log("account")
        console.log(account)
        const ownerFromCall = (await getOwner()).toString()
        setOwner(ownerFromCall)
        console.log("owner")
        console.log(ownerFromCall)
        console.log("title")
        console.log(title)
        console.log("contractAddress")
        console.log(contractAddress)
        if (!titleFromQuery) {
            const titleFromCall = (await getTitle()).toString()
            console.log("title")
            console.log(titleFromCall)
            setTitle(titleFromCall)
        }
        if (!descriptionFromQuery) {
            const descriptionFromCall = (await getDescription()).toString()
            console.log("description")
            console.log(descriptionFromCall)
            setDescription(descriptionFromCall)
        }
        const optionsLengthFromCall = (await getOptionsLength()).toString()
        const userVoteFromCall = (await getEntry()).toString() - 1
        console.log("userVoteFromCall")
        console.log(userVoteFromCall)
        setUserVote(userVoteFromCall)
        let optionsFromCall = []
        let votesFromCall = []
        for (let i = 0; i < optionsLengthFromCall; i++) {
            /* View Functions */

            let listOptions = {
                abi: pollEntryAbi,
                contractAddress: contractAddress,
                functionName: "getOption",
                params: { index: i },
            }

            let option
            option = await runContractFunction({
                params: listOptions,
                onSuccess: (data) => {
                    option = data
                },
                onError: (error) => console.log(error),
            })

            optionsFromCall.push(option)
            console.log("option" + i)
            console.log(option)

            listOptions = {
                abi: pollEntryAbi,
                contractAddress: contractAddress,
                functionName: "getVotes",
                params: { index: i },
            }

            let vote
            vote = await runContractFunction({
                params: listOptions,
                onSuccess: (data) => {
                    option = data
                },
                onError: (error) => console.log(error),
            })
            console.log("vote" + i)
            console.log(vote)
            votesFromCall.push(vote)
        }
        setOptions(optionsFromCall)
        setVotes(votesFromCall)
        console.log("options")
        console.log(options)
        setIsLoading(false)
    }

    const handleNewNotification = () => {
        dispatch({
            type: "info",
            message: "Voted!",
            title: "Transaction Notification",
            position: "topR",
        })
    }

    const handleSuccess = async (tx) => {
        console.log(tx)
        await tx.wait(1)
        handleNewNotification(tx)
        updateUIValues()
    }

    const selectOption = async () => {
        if (checkedOption != -1) {
            console.log("checkedOption")
            console.log(checkedOption)
            const listOptions = {
                abi: pollEntryAbi,
                contractAddress: contractAddress,
                functionName: "vote",
                params: {
                    option_index: checkedOption,
                },
            }

            await runContractFunction({
                params: listOptions,
                onSuccess: handleSuccess,
                onError: (error) => console.log(error),
            })
        }
    }
    const endThisPoll = async () => {
        const tx = await endPoll()
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "Poll Ended!",
            title: "Transaction Notification",
            position: "topR",
        })
        updateUIValues()
    }

    return (
        <div>
            <Header />
            {!isLoading ? (
                <div className="flex flex-col text-center">
                    {console.log("not loading")}
                    <div className="w-fit m-auto space-y-4 mt-5">
                        <Information information={contractAddress} topic="Contract Address" />
                        <Information information={title} topic="Title" />
                        <Information information={description} topic="Description" />
                    </div>
                    <div>
                        <p className=" text-3xl mt-12 font-semibold">Options</p>
                        <ul className="w-fit m-auto mt-4 mb-12 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            {options.map((option, index) => (
                                <div className=" px-12" key={index + 1}>
                                    <li className="w-full rounded-t-lg border-b border-gray-200 dark:border-gray-600">
                                        <div className="flex items-center pl-3">
                                            <input
                                                id={"option" + index}
                                                type="radio"
                                                value=""
                                                disabled={userVote != -1 || isPollEnded}
                                                name="list-radio"
                                                checked={
                                                    (checkedOption == index ? true : false) ||
                                                    userVote == index
                                                }
                                                onChange={(d) => {
                                                    console.log("onChanged : " + index)
                                                    setCheckedOption(index)
                                                }}
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                            />
                                            <label
                                                htmlFor={"option" + index}
                                                className="py-3 ml-2 w-full text-sm font-medium text-gray-900 dark:text-gray-300"
                                            >
                                                <div className="flex space-x-4">
                                                    <Tag text={option} theme="regular" />
                                                    <Tag
                                                        color="grey"
                                                        text={"Votes " + votes[index]}
                                                        tone="dark"
                                                    />
                                                    {userVote == index ? (
                                                        <Tag color="red" text={"Voted!"} />
                                                    ) : null}
                                                </div>
                                            </label>
                                        </div>
                                    </li>
                                </div>
                            ))}
                        </ul>
                    </div>
                    {isPollEnded ? (
                        <div className="m-auto mt-5">
                            <Tag color="red" text="Poll Ended" tone="dark" />
                        </div>
                    ) : null}
                    <div className="m-auto mt-5">
                        <Button
                            onClick={selectOption}
                            text="submit"
                            theme="primary"
                            disabled={userVote != -1 || isPollEnded}
                        />
                    </div>
                    <div className="mt-5 m-auto">
                        <Button
                            onClick={endThisPoll}
                            text="End Poll"
                            theme="primary"
                            disabled={
                                ethers.utils.getAddress(account) !=
                                    ethers.utils.getAddress(owner) || isPollEnded
                            }
                        />
                    </div>
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
