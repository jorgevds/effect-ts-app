"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_CORE } from "../../app/nav-core";
import { HomeIcon } from "../icons/home";
import { PersonIcon } from "../icons/person";

const SITE_NAV = [
    {
        url: NAV_CORE.home.base,
        label: "Home",
        icon: <HomeIcon />,
    },
    {
        url: NAV_CORE.oneTime.base,
        label: "One time chores",
        icon: <PersonIcon />,
    },
];

export const ChoreToggleGroup = () => {
    const pathName = usePathname();

    const activeStyle = "border-blue-500 font-medium text-blue-600";
    const inactiveStyle = "border-transparent text-gray-500 hover:text-blue-600 focus:outline-hidden focus:text-blue-600";

    return (
        <div className="border-b-2 border-gray-200">
            <nav className="-mb-0.5 flex gap-x-6">
                {SITE_NAV.map(nav => (
                    <Link
                        className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 text-sm whitespace-nowrap focus:outline-hidden focus:text-blue-600 ${pathName.includes(nav.url) ? activeStyle : inactiveStyle}`}
                        href={nav.url}
                        key={nav.label}
                    >
                        {nav.icon}
                        {nav.label}
                    </Link>
                ))}
            </nav>
        </div>
    );
};
