import Link from "next/link";

export const Header = () => (
    <header className="h-16 border-b border-b-black bg-white text-black">
        <div className="flex h-full px-4 container mx-auto">
            <div className="flex justify-between items-center flex-1">
                <h1 className="font-semibold text-3xl">
                    <Link href="/" scroll={false}>
                        Chore world
                    </Link>
                </h1>
                <ul>
                    <Link href="/add" scroll={false}>
                        <li className="py-3 px-4 inline-flex items-center text-sm font-medium rounded-full border border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200 focus:outline-none focus:bg-blue-200 disabled:opacity-50 disabled:pointer-events-none ">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-plus mr-2"
                            >
                                <path d="M5 12h14" />
                                <path d="M12 5v14" />
                            </svg>
                            <span>Add</span>
                        </li>
                    </Link>
                </ul>
            </div>
        </div>
    </header>
);
