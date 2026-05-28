import { useEffect, useState } from "react";

export function useTypewriter({
    text,
    isActive,
    speed,
    resetWhenInactive = true,
}) {
    const [typedText, setTypedText] = useState("");

    useEffect(() => {
        if (!isActive && resetWhenInactive) {
            const timeoutId = setTimeout(() => {
                setTypedText("");
            }, 0);

            return () => clearTimeout(timeoutId);
        }
    }, [isActive, resetWhenInactive, text]);

    useEffect(() => {
        if (!isActive) return;
        if (typedText.length >= text.length) return;

        const timeoutId = setTimeout(() => {
            setTypedText(text.slice(0, typedText.length + 1));
        }, speed);

        return () => clearTimeout(timeoutId);
    }, [isActive, speed, text, typedText]);

    return typedText;
}
