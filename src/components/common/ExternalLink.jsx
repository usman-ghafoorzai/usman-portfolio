export default function ExternalLink({
    children,
    target = "_blank",
    rel = "noopener noreferrer",
    ...props
}) {
    return (
        <a target={target} rel={rel} {...props}>
            {children}
        </a>
    );
}
