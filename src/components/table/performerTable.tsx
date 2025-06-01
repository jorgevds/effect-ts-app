"use client";
import { format } from "date-fns";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "./table";
import { PerformerTableActions } from "./performerTableActions";
import { useFormState } from "react-dom";
import { performancesTableServerAction } from "../../server-actions/performanceTable";
import { FormStateStatus } from "../../server-actions/createChore";
import { FormToast } from "../formToast";

export interface PerformanceRow {
    id: string;
    choreId: string;
    timestamp: Date;
    date: Date;
    name: string;
}

const columnHelper = createColumnHelper<PerformanceRow>();

const columns = [
    columnHelper.group({
        header: "when was this chore done",
        footer: props => props.column.id,
        columns: [
            columnHelper.accessor("date", {
                cell: info => format(info.getValue(), "MM/dd/yyyy"),
                footer: props => props.column.id,
            }),
            columnHelper.accessor("timestamp", {
                cell: info => format(info.getValue(), "kk:mm:ss"),
                footer: props => props.column.id,
            }),
        ],
    }),
    columnHelper.group({
        header: "who did the chore",
        footer: props => props.column.id,
        columns: [
            columnHelper.accessor("name", {
                cell: info => info.getValue(),
                footer: props => props.column.id,
            }),
        ],
    }),
    columnHelper.display({
        id: "actions",
        cell: props => <PerformerTableActions cellContext={props} choreId={props.row.original.choreId} />,
    }),
];

export const PerformancesTable = ({ data }: { data: { content: PerformanceRow[]; choreId: string } }) => {
    const [formState, action] = useFormState(performancesTableServerAction, {
        choreId: data.choreId,
        error: "",
        status: "initial" as FormStateStatus,
    });

    return (
        <>
            <form action={action}>
                <DataTable columns={columns} data={data.content} />
            </form>

            <FormToast formState={formState} messages={{ success: formState.success ?? "Action successful", error: formState.error }} />
        </>
    );
};
