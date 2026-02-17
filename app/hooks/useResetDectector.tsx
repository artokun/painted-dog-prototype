"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { openResetPassword } from "@/app/store/resetPasswordStore";

export const useResetPasswordDetector = () => {
    const pathname = usePathname();

    useEffect(() => {
        // Match /account/reset/[customerId]/[token]
        const match = pathname.match(/^\/account\/reset\/([^/]+)\/([^/]+)$/);

        if (match) {
            const [, customerId, token] = match;
            openResetPassword(customerId, token);

            // Clean up URL without reload
            window.history.replaceState({}, "", "/");
        }
    }, [pathname]);
};