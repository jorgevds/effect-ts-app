import { ReactNode } from "react";
import { Hamburger } from "../icons/hamburger";

interface HeaderMenuProps {
    children: ReactNode;
}

export const HeaderMenu = ({ children }: HeaderMenuProps) => {
    return (
        <>
            {/* mobile */}
            <div className="hs-dropdown relative inline-flex sm:hidden">
                <button
                    id="hs-dropdown-custom-icon-trigger"
                    type="button"
                    className="hs-dropdown-toggle flex justify-center items-center size-9 text-sm font-semibold rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                    aria-haspopup="menu"
                    aria-expanded="false"
                    aria-label="Dropdown"
                >
                    <Hamburger />
                </button>

                <div
                    className="hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden min-w-60 bg-white shadow-md rounded-lg mt-2 z-50"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="hs-dropdown-custom-icon-trigger"
                >
                    <div className="p-1 space-y-0.5">{children}</div>
                </div>
            </div>
            {/* non-mobile */}
            <div className="hidden sm:inline-flex">{children}</div>
        </>
    );
};
