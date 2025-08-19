import { Chore } from "../../data/domains/chore/types";
import { ChoreCompleteButton } from "../chore/completeButton";

interface ChoreListChoreProps {
    chore: Chore;
}

export const ChoreListChore = ({ chore }: ChoreListChoreProps) => {
    const isComplete = chore.performances.length > 0;

    return (
        <div className="flex items-center justify-between my-4" key={chore.id}>
            <div>
                <div
                    className={`${isComplete ? "line-through" : ""} hover:no-underline flex flex-col`}
                    title={`${chore.name} - ${isComplete ? "Completed" : "Not completed"}`}
                >
                    {chore.name}
                    {!isComplete ? <span className="text-xs">Estimated time to do: {chore.estimationMinutes} minutes</span> : null}
                </div>
            </div>

            {isComplete ? null : (
                <div className="flex items-center">
                    <div className="mr-4 z-20">
                        <ChoreCompleteButton id={chore.id} />
                    </div>
                </div>
            )}
        </div>
    );
};
