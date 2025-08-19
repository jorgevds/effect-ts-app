import "../styles/global.css";

import PrelineScript from "../components/prelineLoader";
import { Header } from "../components/header/header";

export const metadata = {
    title: "Chore world",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="flex flex-col min-h-screen flex-1 font-mono">
                <Header />
                <div className="flex h-full flex-1 bg-indigo-50">
                    <div className="p-4 container mx-auto">{children}</div>
                </div>
            </body>
            <PrelineScript />
        </html>
    );
}
