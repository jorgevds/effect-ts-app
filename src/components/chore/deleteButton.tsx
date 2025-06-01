"use client";

import { useFormState } from "react-dom";
import { deleteChoreServerAction } from "../../server-actions/deleteChore";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FormStateStatus } from "../../server-actions/createChore";

export const DeleteButton = ({ id }: { id: string }) => {
    const [formState, formAction] = useFormState(deleteChoreServerAction, { id, status: "initial" as FormStateStatus, error: "" });
    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (formState.status === "success") {
            router.push("/");
        }
    }, [formState]);

    return (
        <form action={formAction} ref={formRef}>
            <button
                onClick={() => {
                    const confirmation = confirm("Are you sure you want to delete this chore? This action cannot be undone.");
                    if (confirmation) {
                        formRef.current && formRef.current.requestSubmit();
                        setTimeout(() => router.push("/", { scroll: false }), 200);
                    }
                }}
                type="button"
                className="py-3 px-4 inline-flex items-center text-sm font-medium rounded-lg border border-transparent  focus:outline-none  disabled:opacity-50 disabled:pointer-events-none border-red-100 bg-red-200 text-red-800 hover:bg-red-300"
            >
                <span className="pr-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-trash-2"
                    >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        <line x1="10" x2="10" y1="11" y2="17" />
                        <line x1="14" x2="14" y1="11" y2="17" />
                    </svg>
                </span>
                Delete
            </button>
        </form>
    );
};
