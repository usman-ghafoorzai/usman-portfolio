import { useEffect, useRef, useState } from "react";

type InViewOnceOptions = {
    threshold?: number | number[];
};

export function useInViewOnce<T extends Element = HTMLElement>(
    { threshold = 0.3 }: InViewOnceOptions = {},
) {
    const ref = useRef<T | null>(null);
    const [hasEnteredView, setHasEnteredView] = useState(false);

    useEffect(() => {
        const element = ref.current;

        if (!element || hasEnteredView) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) {
                    setHasEnteredView(true);
                    observer.disconnect();
                }
            },
            { threshold },
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [threshold, hasEnteredView]);

    return {
        ref,
        hasEnteredView,
    };
}
