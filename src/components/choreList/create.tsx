"use client";

import { useFormState } from "react-dom";
import { FormToast } from "../toast/formToast";
import { useEffect, useState } from "react";
import { createChoreListSA } from "../../server-actions/choreList/create";
import { FormStateStatus } from "../../server-actions/types";
import { useRouter } from "next/navigation";
import { NAV_CORE } from "../../app/nav-core";

const choreListCreateInitialState = { name: "", chores: [] };

export const CreateChoreList = () => {
    const [formState, formAction] = useFormState(createChoreListSA, { status: "initial" as FormStateStatus, error: "", choreListId: "" });
    const router = useRouter();

    const [formValues, setFormValues] = useState(choreListCreateInitialState);

    const onClear = () => setFormValues(choreListCreateInitialState);

    useEffect(() => {
        if (formState.status === "success" && formState.choreListId) {
            router.push(NAV_CORE.oneTime.byId(formState.choreListId));
        }
    }, [formState]);

    return (
        <>
            <form action={formAction} className="max-w-sm pt-8">
                <div className="max-w-sm pb-4">
                    <label htmlFor="chore" className="block text-sm font-medium mb-2 ">
                        What do you have to do?
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formValues.name}
                        onChange={event => setFormValues(state => ({ ...state, name: event.target.value }))}
                        className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none "
                        placeholder="Chore list #1"
                    />
                </div>

                {formState.error ? <p className="text-sm text-red-600 mb-4">{formState.error}</p> : null}

                <div className="w-full flex justify-between">
                    <button
                        type="submit"
                        className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200 focus:outline-none focus:bg-blue-200 disabled:opacity-50 disabled:pointer-events-none "
                        disabled={!formValues.name}
                    >
                        Create
                    </button>

                    <button
                        type="button"
                        className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent text-red-800 hover:bg-red-100 focus:outline-none focus:bg-red-200 disabled:opacity-50 disabled:pointer-events-none"
                        onClick={onClear}
                    >
                        Clear
                    </button>
                </div>
            </form>

            <FormToast
                formState={formState}
                messages={{
                    success: "Successfully created chore list",
                    error: formState.error ?? "Something went wrong adding a new chore",
                }}
            />
        </>
    );
};
