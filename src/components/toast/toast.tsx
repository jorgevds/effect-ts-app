import { NAV_CORE } from "../../app/nav-core";
import { AppLink } from "../app-link";

export const Toast = ({ message, choreId }: { message: string; choreId?: string | undefined }) => {
    return (
        <div
            className="max-w-xs bg-white border border-gray-200 rounded-xl shadow-lg absolute bottom-12 left-1/2 transform -translate-x-1/2 "
            role="alert"
            tabIndex={-1}
            aria-labelledby="hs-toast-success-example-label"
        >
            <div className="flex p-4">
                <div className="ms-3">
                    <p id="hs-toast-success-example-label" className="text-sm text-gray-700 ">
                        {message}
                    </p>
                    {choreId ? <AppLink href={NAV_CORE.home.chore.byId(choreId)}>Take me there</AppLink> : null}
                </div>
            </div>
        </div>
    );
};
