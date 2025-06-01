import { DeleteButton } from "./deleteButton";
import { ChoreFull } from "../../data/domains/chore/types";
import { differenceInDays } from "date-fns";
import { ChoreCompleteButton } from "./completeButton";
import { PerformanceRow, PerformancesTable } from "../table/performerTable";

interface ChoreDetailProps {
    chore: ChoreFull;
}

export const ChoreDetail = ({ chore }: ChoreDetailProps) => {
    const tableData: PerformanceRow[] = chore.performances.map(perf => ({
        id: perf.id,
        choreId: chore.id,
        name: perf.performer.name,
        timestamp: perf.timePerformed,
        date: perf.timePerformed,
    }));

    return (
        <div className="flex flex-col">
            <div className="flex justify-between pb-8">
                <h2 className="text-3xl">{chore.name}</h2>
                <ChoreCompleteButton id={chore.id} />
            </div>

            <div>
                <span className="font-bold">where:</span> {chore.location?.name}
            </div>
            <div>
                <span className="font-bold">should take:</span> {chore.estimationMinutes} minutes
            </div>
            <div>
                <span className="font-bold">do again:</span> {differenceInDays(chore.timeInvalid, new Date())} days
            </div>

            {chore.performances.length > 0 ? (
                <div className="pt-28 w-1/2">
                    <h3 className="text-xl pb-4">Performances</h3>
                    <PerformancesTable data={{ content: tableData, choreId: chore.id }} />
                </div>
            ) : null}

            <div className="pt-32">
                <DeleteButton id={chore.id} />
            </div>
        </div>
    );
};
