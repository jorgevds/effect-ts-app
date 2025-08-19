"use client";

import { useFormState } from "react-dom";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FormStateStatus } from "../../server-actions/types";
import { deleteChoreListServerAction } from "../../server-actions/choreList/delete";
import { NAV_CORE } from "../../app/nav-core";
import { DeleteIcon } from "../icons/delete";

export const DeleteChoreListButton = ({ id }: { id: string }) => {
    const [formState, formAction] = useFormState(deleteChoreListServerAction, { id, status: "initial" as FormStateStatus, error: "" });
    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();

    const onDeleteClicked = () => {
        const confirmation = confirm("Are you sure you want to delete this chore list? This action cannot be undone.");
        if (confirmation) {
            formRef.current && formRef.current.requestSubmit();
            setTimeout(() => router.push(NAV_CORE.oneTime.base, { scroll: false }), 200);
        }
    };

    // TODO: deleting is unmounting this component, so this effect never triggers
    useEffect(() => {
        if (formState.status === "success") {
            router.push(NAV_CORE.oneTime.base);
        }
    }, [formState]);

    return (
        <form action={formAction} ref={formRef}>
            <button
                onClick={onDeleteClicked}
                type="button"
                className="py-3 px-4 inline-flex items-center text-sm font-medium rounded-lg border border-transparent  focus:outline-none  disabled:opacity-50 disabled:pointer-events-none border-red-100 bg-red-200 text-red-800 hover:bg-red-300"
            >
                <span className="pr-2">
                    <DeleteIcon />
                </span>
                Delete chore list
            </button>
        </form>
    );
};
