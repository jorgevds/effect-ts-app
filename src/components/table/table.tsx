"use client";

import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";

interface DataTableProps<T> {
    columns: ColumnDef<T>[];
    data: T[];
}

export const DataTable = <T extends any>({ columns, data }: DataTableProps<T>) => {
    const table = useReactTable({
        columns,
        data,
        getCoreRowModel: getCoreRowModel(),
        initialState: { columnPinning: { right: ["actions"] } },
    });

    return (
        <table className="w-full border border-black">
            <thead>
                {table.getHeaderGroups().map(headerGroup => {
                    return (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th
                                    key={header.id}
                                    colSpan={header.colSpan}
                                    {...{
                                        style: {
                                            width: header.getSize(),
                                        },
                                    }}
                                >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    );
                })}
            </thead>
            <tbody>
                {table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="first:border-t first:border-black">
                        {row.getVisibleCells().map(cell => (
                            <td key={cell.id} className="text-center">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
