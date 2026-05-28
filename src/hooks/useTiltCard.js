export function useTiltCard({ maxTilt = 7 } = {}) {
    function handleTiltMove(event) {
        const card = event.currentTarget;
        const rect = card.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const rotateY = ((x / rect.width) - 0.5) * maxTilt * 2;
        const rotateX = -((y / rect.height) - 0.5) * maxTilt * 2;

        card.style.setProperty("--tilt-rotate-x", `${rotateX}deg`);
        card.style.setProperty("--tilt-rotate-y", `${rotateY}deg`);
        card.style.setProperty("--tilt-glow-x", `${x}px`);
        card.style.setProperty("--tilt-glow-y", `${y}px`);
    }

    function handleTiltLeave(event) {
        const card = event.currentTarget;

        card.style.setProperty("--tilt-rotate-x", "0deg");
        card.style.setProperty("--tilt-rotate-y", "0deg");
        card.style.setProperty("--tilt-glow-x", "50%");
        card.style.setProperty("--tilt-glow-y", "50%");
    }

    return {
        handleTiltMove,
        handleTiltLeave,
    };
}
