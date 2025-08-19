"use client";

import { useFormState } from "react-dom";
import { FormToast } from "../toast/formToast";
import { useState } from "react";
import { FormStateStatus } from "../../server-actions/types";
import { addChoreToListSA } from "../../server-actions/choreList/add";

const choreCreateInitialState = { chore: "", location: "", estimatedTime: "" };

export const AddChore = ({ id }: { id: string }) => {
    const [formState, formAction] = useFormState(addChoreToListSA, { status: "initial" as FormStateStatus, id, error: "" });

    const [formValues, setFormValues] = useState(choreCreateInitialState);

    const onClear = () => setFormValues(choreCreateInitialState);

    return (
        <>
            <form action={formAction} className="max-w-sm py-8">
                <div className="max-w-sm pb-4">
                    <label htmlFor="chore" className="block text-sm font-medium mb-2 ">
                        What do you have to do?
                    </label>
                    <input
                        type="text"
                        id="chore"
                        name="chore"
                        value={formValues.chore}
                        onChange={event => setFormValues(state => ({ ...state, chore: event.target.value }))}
                        className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none "
                        placeholder="do the dishes"
                    />
                </div>
                <div className="max-w-sm pb-4">
                    <label htmlFor="place" className="block text-sm font-medium mb-2 ">
                        Where do you have to do this?
                    </label>
                    <input
                        type="text"
                        id="location"
                        name="location"
                        value={formValues.location}
                        onChange={event => setFormValues(state => ({ ...state, location: event.target.value }))}
                        className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none "
                        placeholder="kitchen"
                    />
                </div>

                <div className="max-w-sm pb-8">
                    <label htmlFor="estimatedTime" className="block text-sm font-medium mb-2 ">
                        How long will it take you to do this (minutes)
                    </label>
                    <input
                        type="text"
                        id="estimatedTime"
                        name="estimatedTime"
                        value={formValues.estimatedTime}
                        onChange={event => setFormValues(state => ({ ...state, estimatedTime: event.target.value }))}
                        className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none "
                        placeholder="15"
                    />
                </div>

                {formState.error ? <p className="text-sm text-red-600 mb-4">{formState.error}</p> : null}

                <div className="w-full flex justify-between">
                    <button
                        type="submit"
                        className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200 focus:outline-none focus:bg-blue-200 disabled:opacity-50 disabled:pointer-events-none "
                        disabled={!formValues.chore || !formValues.location || !formValues.estimatedTime}
                    >
                        Add chore
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
                    success: "Successfully added a new chore to the list",
                    error: formState.error ?? "Something went wrong adding a new chore",
                }}
            />
        </>
    );
};
