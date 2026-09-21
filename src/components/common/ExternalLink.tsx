import type { ComponentPropsWithoutRef } from "react";

export default function ExternalLink({
    children,
    target = "_blank",
    rel = "noopener noreferrer",
    ...props
}: ComponentPropsWithoutRef<"a">) {
    return (
        <a target={target} rel={rel} {...props}>
            {children}
        </a>
    );
}
