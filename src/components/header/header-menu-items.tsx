import Link from "next/link";

import { NAV_CORE } from "../../app/nav-core";
import { PlusIcon } from "../icons/plus";
import { JWTPayload } from "jose";
import { CustomJwt } from "../../data/domains/authentication/service";

interface HeaderMenuProps {
    user: (CustomJwt & JWTPayload) | null;
}

export const HeaderMenuItems = ({ user }: HeaderMenuProps) => {
    return (
        <>
            <Link href={NAV_CORE.add} scroll={false}>
                <li
                    className="
                        flex 
                        items-center 
                        py-2 
                        px-3 
                        rounded-lg 
                        text-sm 
                        text-gray-800 
                        focus:outline-hidden 
                        focus:bg-gray-100
                        sm:py-3 
                        sm:px-4 
                        sm:inline-flex 
                        font-medium 
                        sm:rounded-full 
                        sm:border 
                        sm:border-transparent 
                        sm:bg-yellow-100 
                        sm:text-yellow-800 
                        sm:hover:bg-yellow-200
                        "
                >
                    <PlusIcon />
                    <span>Add</span>
                </li>
            </Link>

            {user ? (
                <Link href={NAV_CORE.logout} scroll={false}>
                    <div className="py-3 px-4 border-t border-gray-100 block sm:hidden">
                        <p className="text-sm text-gray-500 dark:text-neutral-400">Signed in as</p>
                        <p className="text-sm font-medium text-gray-800">{user.email}</p>
                    </div>
                    <li
                        className="
                                flex 
                                items-center 
                                gap-x-3.5 
                                py-2 
                                px-3 
                                rounded-lg 
                                text-sm 
                                text-red-800 
                                focus:outline-hidden 
                                focus:bg-gray-100
                                sm:py-3 
                                sm:px-4 
                                sm:ml-4 
                                sm:inline-flex 
                                sm:text-black
                                font-medium 
                                sm:rounded-full 
                                sm:border 
                                sm:border-red-200 
                                sm:hover:bg-red-200 
                                focus:outline-none 
                                sn:focus:bg-blue-200
                                "
                    >
                        <span>Log out</span>
                    </li>
                </Link>
            ) : (
                <Link href={NAV_CORE.login} scroll={false}>
                    <li
                        className="
                            flex 
                            gap-x-3.5 
                            py-2 
                            px-3 
                            rounded-lg 
                            text-gray-800 
                            border-t
                            border-gray-100
                            focus:bg-gray-100
                            sm:text-black
                            sm:py-3 
                            sm:px-4 
                            sm:inline-flex 
                            sm:ml-4 
                            items-center 
                            text-sm 
                            font-medium 
                            sm:rounded-full 
                            sm:border 
                            sm:border-yellow-200 
                            sm:hover:border-yellow-600 
                            focus:outline-none 
                            sm:focus:bg-blue-200
                            "
                    >
                        <span>Log in</span>
                    </li>
                </Link>
            )}
        </>
    );
};
