import { CreateChoreList } from "../../../../components/choreList/create";
import { AppLink } from "../../../../components/app-link";
import { NAV_CORE } from "../../../nav-core";

export default function AddChoreList() {
    return (
        <div>
            <h2 className="text-3xl pt-4">Create a new list of chores</h2>

            <CreateChoreList />

            <div className="pt-8">
                <AppLink href={NAV_CORE.base}>Back to the action</AppLink>
            </div>
        </div>
    );
}
