"use client";

import { useFormState } from "react-dom";
import { login } from "../server-actions/login";
import { FormStateStatus } from "../server-actions/createChore";
import { FormToast } from "./formToast";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const LoginForm = () => {
    const router = useRouter();
    const [formState, action] = useFormState(login, { status: "initial" as FormStateStatus, error: "" });
    const [formValues, setFormValues] = useState({ email: "", password: "" });

    useEffect(() => {
        if (formState.status === "success") {
            router.push("/home");
        }
    }, [formState.status]);

    return (
        <>
            <form action={action} className="flex flex-col max-w-sm pt-8">
                <div className="max-w-sm pb-4">
                    <label htmlFor="email" className="block text-sm font-medium mb-2 ">
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formValues.email}
                        onChange={event => setFormValues(state => ({ ...state, email: event.target.value }))}
                        className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none "
                        placeholder="Email"
                    />
                </div>

                <div className="max-w-sm pb-8">
                    <label htmlFor="password" className="block text-sm font-medium mb-2 ">
                        Password
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={formValues.password}
                        onChange={event => setFormValues(state => ({ ...state, password: event.target.value }))}
                        className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none "
                        placeholder="Password"
                    />
                </div>

                <div className="w-full flex">
                    <button
                        type="submit"
                        className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200 focus:outline-none focus:bg-blue-200 disabled:opacity-50 disabled:pointer-events-none"
                        disabled={!formValues.email || !formValues.password}
                    >
                        Login
                    </button>
                </div>
            </form>

            <FormToast formState={formState} messages={{ success: "Successfully logged in", error: "Log in details not correct" }} />
        </>
    );
};
