import { CreateChore } from "../../../components/chore/create";
import { AppLink } from "../../../components/app-link";
import { NAV_CORE } from "../../nav-core";

export default async function Add() {
    return (
        <div>
            <h2 className="text-3xl pt-4">Add a new chore</h2>

            <CreateChore />

            <div className="pt-8">
                <AppLink href={NAV_CORE.base}>Back to the action</AppLink>
            </div>
        </div>
    );
}
