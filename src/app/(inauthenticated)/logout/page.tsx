"use client";
import { useRouter } from "next/navigation";

import { logout } from "../../../server-actions/logout";
import { NAV_CORE } from "../../nav-core";
import { useEffect, useRef } from "react";

export default function Logout() {
    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (formRef && formRef.current) {
            formRef.current.requestSubmit();
            setTimeout(() => router.push(NAV_CORE.base), 200);
        }
    }, [formRef]);

    return <form action={logout} ref={formRef} />;
}
