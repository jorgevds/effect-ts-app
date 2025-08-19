import { ChoreList } from "../../data/domains/chore-list/types";
import { AddChore } from "./add";
import { ChoreListChore } from "./choreListChore";
import { CompleteChoreListButton } from "./completeButton";
import { DeleteChoreListButton } from "./deleteButton";

interface ChoreListDetail {
    choreList: ChoreList;
}

export const ChoreListDetail = ({ choreList }: ChoreListDetail) => {
    return (
        <div className="pt-4 flex flex-col">
            <div className="flex items-center pb-8">
                <h2 className="text-3xl pr-8 leading-8">{choreList.name}</h2>
                {choreList.complete ? (
                    <span className="leading-8 inline-flex items-center gap-x-1.5 px-3 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                        Complete
                    </span>
                ) : (
                    <span className="leading-8 inline-flex items-center gap-x-1.5 px-3 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 whitespace-nowrap">
                        Not complete
                    </span>
                )}
            </div>

            {!choreList.complete ? (
                <div className="pb-8">
                    <AddChore id={choreList.id} />
                    <hr className="border" />
                </div>
            ) : null}

            <h3 className="text-xl pb-4">Chores:</h3>

            {choreList.chores.map(chore => (
                <ChoreListChore chore={chore} key={chore.id} />
            ))}

            <div className="flex pt-32">
                {!choreList.complete ? (
                    <div className="flex mr-8">
                        <CompleteChoreListButton id={choreList.id} />
                    </div>
                ) : null}
                <DeleteChoreListButton id={choreList.id} />
            </div>
        </div>
    );
};
