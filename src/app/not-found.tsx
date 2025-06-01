import { AppLink } from "../components/link";

export default function NotFoundPage() {
    return (
        <div className="flex flex-col h-full flex-1 bg-violet-100">
            <div className="m-auto">
                Looks like you got lost, bub
                <div>
                    Click this <AppLink href="/">link</AppLink> to go back to the home page
                </div>
            </div>
        </div>
    );
}
