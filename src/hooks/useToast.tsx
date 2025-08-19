import { useEffect, useState } from "react";
import { Toast } from "../components/toast";
import { FormStateStatus } from "../server-actions/types";

export const useToast = <T extends { status: FormStateStatus; error?: string }>(
    formState: T,
    messages: { success: string; error: string }
) => {
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        if (formState.status === "success" || formState.error) {
            setShowToast(true);

            setTimeout(() => setShowToast(false), 5000);
        }
    }, [formState]);

    const UsedToast = () => (showToast ? <Toast message={formState.status === "success" ? messages.success : messages.error} /> : null);

    return { UsedToast };
};
