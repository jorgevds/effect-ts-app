"use client";

import { CellContext } from "@tanstack/react-table";
import { PerformanceRow } from "./performerTable";

interface PerformerTableActionsProps {
    cellContext: CellContext<PerformanceRow, unknown>;
    choreId: string;
}

export const PerformerTableActions = ({ cellContext }: PerformerTableActionsProps) => {
    return (
        <div className="hs-dropdown relative inline-flex">
            <input name="id" defaultValue={cellContext.row.original.id} hidden readOnly />
            <input name="action" defaultValue="deletePerformance" hidden readOnly />

            <button
                id="hs-dropdown-unstyled"
                type="button"
                className="hs-dropdown-toggle inline-flex justify-center items-center gap-x-2"
                aria-expanded="false"
                aria-label="Menu"
            >
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
                    className="lucide lucide-ellipsis-vertical"
                >
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                </svg>
            </button>

            <div
                className="hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 w-56 hidden z-10 mt-2 min-w-60 bg-white"
                role="menu"
                aria-labelledby="hs-dropdown-unstyled"
            >
                <button className="block" type="submit">
                    Delete performance
                </button>
            </div>
        </div>
    );
};
