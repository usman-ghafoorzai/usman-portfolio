import { useEffect, useState } from "react";

type TerminalTypewriterOptions = {
    readonly lines: readonly string[];
    readonly isActive: boolean;
    readonly typeSpeed: number;
    readonly lineDelay: number;
};

export function useTerminalTypewriter({
    lines,
    isActive,
    typeSpeed,
    lineDelay,
}: TerminalTypewriterOptions): readonly string[] {
    const [lineIndex, setLineIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [typedLines, setTypedLines] = useState<string[]>([""]);

    useEffect(() => {
        if (!isActive) return;
        if (typedLines.length === 0) return;
        if (lineIndex >= lines.length) return;
        const currentLine = lines[lineIndex];
        if (currentLine === undefined) return;
        let timeoutId: ReturnType<typeof setTimeout>;

        if (charIndex <= currentLine.length) {
            timeoutId = setTimeout(() => {
                setTypedLines((currentLines) => {
                    const nextLines = [...currentLines];
                    nextLines[lineIndex] = currentLine.slice(0, charIndex);
                    return nextLines;
                });

                setCharIndex((currentIndex) => currentIndex + 1);
            }, charIndex === 0 ? lineDelay : typeSpeed);
        } else {
            timeoutId = setTimeout(() => {
                if (lineIndex < lines.length - 1) {
                    setTypedLines((currentLines) => [...currentLines, ""]);
                }

                setLineIndex((currentIndex) => currentIndex + 1);
                setCharIndex(0);
            }, lineDelay);
        }

        return () => clearTimeout(timeoutId);
    }, [isActive, typedLines.length, lineIndex, charIndex, lines, typeSpeed, lineDelay]);

    return typedLines;
}
