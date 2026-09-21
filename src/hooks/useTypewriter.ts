import { useEffect, useState } from "react";

type TypewriterOptions = {
    text: string;
    isActive: boolean;
    speed: number;
};

export function useTypewriter({
    text,
    isActive,
    speed,
}: TypewriterOptions): string {
    const [typedText, setTypedText] = useState("");

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
