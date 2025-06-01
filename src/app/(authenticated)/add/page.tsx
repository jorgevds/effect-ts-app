import { CreateChore } from "../../../components/chore/create";
import { AppLink } from "../../../components/link";

export default async function Add() {
    return (
        <div>
            <h2 className="text-3xl pt-4">Add a new chore</h2>

            <CreateChore />

            <div className="pt-8">
                <AppLink href="/">Back to the action</AppLink>
            </div>
        </div>
    );
}
