import styles from "../styles/Home.module.css"
import { useNotification, Button } from "@web3uikit/core"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useState } from "react"
import { contractAddresses, poll3Abi } from "../constants"
import Header from "../components/Header"
import { useRouter } from "next/router"

export default function Home() {
    const router = useRouter()
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [optionsLength, setOptionsLength] = useState(-1)
    const { Moralis, isWeb3Enabled, account, chainId: chainIdHex } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const [optionsLengthConfirmed, setOptionsLengthConfirmed] = useState(false)
    const [options, setOptions] = useState([])
    const dispatch = useNotification()

    const { runContractFunction } = useWeb3Contract()
    const poll3Address =
        chainId in contractAddresses ? contractAddresses[chainId]["Poll3"][0] : null

    const createOptions = async () => {
        console.log(optionsLength)
        if (optionsLength > 1 && Number.isInteger(optionsLength)) {
            console.log("creating options...")
            setOptions(Array.apply(null, Array(optionsLength)).map(function () {}))
            setOptionsLengthConfirmed(true)
        }
    }

    const handleSuccess = async (tx) => {
        console.log(tx)
        dispatch({
            type: "success",
            message: "Poll created",
            position: "topR",
        })
        await tx.wait(1)
        router.push("/")
    }

    const createPoll = async () => {
        if (isPollValid()) {
            console.log("Poll valid")
            let listOptions = {
                abi: poll3Abi,
                contractAddress: poll3Address,
                functionName: "createEntry",
                params: {
                    title: title,
                    description: description,
                    options: options,
                },
            }
            console.log("isWeb3Enabled")
            console.log(isWeb3Enabled)
            let pollEntrycontractAddress
            pollEntrycontractAddress = await runContractFunction({
                params: listOptions,
                onSuccess: handleSuccess,
                onError: (error) => {
                    console.log(error)

                    dispatch({
                        type: "error",
                        message: "Unable to create poll",
                        position: "topR",
                    })
                },
            })
        } else {
            console.log("Poll not valid")
            dispatch({
                type: "error",
                message: "Please fill all the details",
                position: "topR",
            })
        }
    }

    const isPollValid = () => {
        if (
            !title ||
            !description ||
            !optionsLengthConfirmed ||
            !Number.isInteger(optionsLength) ||
            !(optionsLength > 1)
        ) {
            return false
        }
        for (let i = 0; i < options.length; i++) {
            if (!options[i]) {
                console.log(options[i])
                console.log(!options[i])
                console.log(i)
                console.log(options)
                return false
            }
        }
        return true
    }

    return (
        <div className={styles.container}>
            <Header />
            <div className="mb-6 mt-5">
                <label
                    htmlFor="title"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                    Title
                </label>
                <input
                    type="text"
                    id="title"
                    onChange={(data) => {
                        const value = data.target.value
                        setTitle(value)
                    }}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    required={true}
                />
            </div>
            <div>
                <label
                    htmlFor="description"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400"
                >
                    Description
                </label>
                <textarea
                    id="description"
                    rows="4"
                    onChange={(data) => {
                        const value = data.target.value
                        setDescription(value)
                    }}
                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Leave a comment..."
                    required={true}
                ></textarea>
            </div>
            <div>
                <label
                    htmlFor="optionsLength"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                    Number of Options
                </label>
                <input
                    type="number"
                    id="optionsLength"
                    min="2"
                    step="1"
                    onChange={(data) => {
                        const value = parseInt(data.target.value)
                        if (Number.isInteger(value)) {
                            setOptionsLength(value)
                        }
                    }}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    required={true}
                />

                <div className="mt-5 mb-5">
                    <Button
                        onClick={createOptions}
                        text="Confirm number of options"
                        theme="primary"
                    />
                </div>
                {optionsLengthConfirmed
                    ? options.map((option, index) => {
                          return (
                              <div className="mb-6" key={index}>
                                  <label
                                      htmlFor={"option" + index}
                                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                                  >
                                      Option {index + 1}
                                  </label>
                                  <input
                                      type="text"
                                      id={"option" + index}
                                      onChange={(data) => {
                                          const value = data.target.value
                                          setOptions((option) => {
                                              options[index] = value
                                              return options
                                          })
                                      }}
                                      value={options[index]}
                                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                      required={true}
                                  />
                              </div>
                          )
                      })
                    : null}
            </div>
            <Button onClick={createPoll} text="Create Poll" theme="primary" />
        </div>
    )
}
