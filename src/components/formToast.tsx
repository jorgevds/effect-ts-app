import { useEffect, useState } from "react";
import { Toast } from "../components/toast";
import { FormStateStatus, StandardFormSubmit } from "../server-actions/createChore";

export interface FormToastable extends StandardFormSubmit {
    success?: string;
}
interface FormToastProps<T> {
    formState: T;
    messages: { success: string; error: string };
}

export const FormToast = <T extends { status: FormStateStatus; error?: string }>({ formState, messages }: FormToastProps<T>) => {
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        if (formState.status === "success" || formState.error) {
            setShowToast(true);

            setTimeout(() => setShowToast(false), 5000);
        }
    }, [formState]);

    return showToast ? <Toast message={formState.status === "success" ? messages.success : messages.error} /> : null;
};
