"use client";

import { useFormState } from "react-dom";
import { useRef } from "react";
import { FormStateStatus } from "../../server-actions/types";
import { DoubleCheckMark } from "../icons/double-check-mark";
import { completeChoreListServerAction } from "../../server-actions/choreList/complete";

export const CompleteChoreListButton = ({ id }: { id: string }) => {
    const [_, formAction] = useFormState(completeChoreListServerAction, { id, status: "initial" as FormStateStatus, error: "" });
    const formRef = useRef<HTMLFormElement>(null);

    const onSubmitClicked = () => {
        const confirmation = confirm("Are you sure you want to complete this chore list? This action cannot be undone.");
        if (confirmation) {
            formRef.current && formRef.current.requestSubmit();
        }
    };

    return (
        <form action={formAction} ref={formRef}>
            <button
                onClick={onSubmitClicked}
                type="button"
                className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200 focus:outline-hidden focus:bg-yellow-200 disabled:opacity-50 disabled:pointer-events-none"
            >
                <span className="pr-2">
                    <DoubleCheckMark />
                </span>
                Complete the list
            </button>
        </form>
    );
};
