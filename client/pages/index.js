import Head from "next/head"
import styles from "../styles/Home.module.css"
import Header from "../components/Header"
import { useMoralis } from "react-moralis"
import PollEntrance from "../components/PollEntrance"

const supportedChains = ["31337", "4"]

export default function Home() {
    const { isWeb3Enabled, chainId } = useMoralis()

    return (
        <div className={styles.container}>
            <Head>
                <title>Poll3</title>
                <meta name="description" content="Decentralized Polling Platform" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header />
            {isWeb3Enabled ? (
                <div>
                    {supportedChains.includes(parseInt(chainId).toString()) ? (
                        <div className="flex flex-row">
                            <PollEntrance className="p-8" />
                        </div>
                    ) : (
                        <div>{`Please switch to a supported chainId. The supported Chain Ids are: ${supportedChains}`}</div>
                    )}
                </div>
            ) : (
                <div className="p-5 border-b-2 flex items-center justify-center">
                    Please connect to a Wallet
                </div>
            )}
        </div>
    )
}
