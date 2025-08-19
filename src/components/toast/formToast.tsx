import { useEffect, useState } from "react";
import { Toast } from "./toast";
import { FormStateStatus, StandardFormSubmit } from "../../server-actions/types";

export interface FormToastable extends StandardFormSubmit {
    success?: string;
}
interface FormToastProps<T> {
    formState: T;
    messages: { success: string; error: string };
}

// TODO: unmounting the component kills the toast message; needs to live in the highest client-side boundary and stay in the vdom until a timer expires
export const FormToast = <T extends { status: FormStateStatus; error?: string; choreId?: string }>({
    formState,
    messages,
}: FormToastProps<T>) => {
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        if (formState.status === "success" || formState.error) {
            setShowToast(true);

            setTimeout(() => setShowToast(false), 5000);
        }
    }, [formState]);

    return showToast ? (
        <Toast choreId={formState.choreId} message={formState.status === "success" ? messages.success : messages.error} />
    ) : null;
};
