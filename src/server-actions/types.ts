import { FormToastable } from "../components/toast/formToast";

export type FormStateStatus = "initial" | "success" | "error";

export interface StandardFormSubmit {
    status: FormStateStatus;
    error?: string;
}

export interface FormState extends FormToastable {
    choreId: string;
}
