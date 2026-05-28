import { useEffect, useRef, useState } from "react";

export function useInViewOnce({ threshold = 0.3 } = {}) {
    const ref = useRef(null);
    const [hasEnteredView, setHasEnteredView] = useState(false);

    useEffect(() => {
        const element = ref.current;

        if (!element || hasEnteredView) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
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
