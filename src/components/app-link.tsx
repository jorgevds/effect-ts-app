import Link from "next/link";

export const AppLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link
        href={href}
        className="text-blue-600 hover:text-blue-500 decoration-2 hover:underline focus:outline-none focus:underline opacity-90"
        scroll={false}
    >
        {children}
    </Link>
);
