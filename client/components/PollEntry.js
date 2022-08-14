import { useRouter } from "next/router"

export default function PollEntry({ contractAddress, title, description }) {
    const router = useRouter()

    const handleItemClick = async () => {
        console.log("Item Clicked with title : " + title)
        console.log("contractAddress")
        console.log(contractAddress)
        router.push(
            {
                pathname: `entry/${contractAddress}`,
                query: {
                    title: title,
                    description: description,
                    contractAddress: contractAddress,
                },
            },
            `entry/${contractAddress}`,
            { shallow: true }
        )
    }
    return (
        <div
            onClick={handleItemClick}
            className={
                "block p-6 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md hover:cursor-pointer hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
            }
        >
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {title}
            </h5>
            <p className="font-normal text-gray-700 dark:text-gray-400">{description}</p>
        </div>
    )
}
