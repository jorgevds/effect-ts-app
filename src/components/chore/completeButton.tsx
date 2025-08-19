"use client";

import { useFormState } from "react-dom";
import { completeChoreServerAction } from "../../server-actions/completeChore";
import { FormToast } from "../toast/formToast";
import { FormStateStatus } from "../../server-actions/types";
import { CheckMark } from "../icons/check-mark";

export const ChoreCompleteButton = ({ id }: { id: string }) => {
    const [formState, action] = useFormState(completeChoreServerAction, { id, error: "", status: "initial" as FormStateStatus });

    return (
        <>
            <form action={action}>
                <button className="py-2 px-4 sm:inline-flex items-center text-sm font-medium rounded-lg border border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200 focus:outline-none focus:bg-blue-200 disabled:opacity-50 disabled:pointer-events-none hidden">
                    Complete chore
                </button>
                <button className="py-2 px-4 inline-flex items-center text-sm font-medium rounded-lg border border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200 focus:outline-none focus:bg-blue-200 disabled:opacity-50 disabled:pointer-events-none sm:hidden">
                    <CheckMark />
                </button>
            </form>
            <FormToast
                formState={formState}
                messages={{
                    success: "Chore completed",
                    error: `Something went wrong completing this chore: ${formState.error}`,
                }}
            />
        </>
    );
};
