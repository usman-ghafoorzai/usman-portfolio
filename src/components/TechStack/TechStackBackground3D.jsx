import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Vector2 } from "three";

const vertexShader = `
attribute vec3 position;

void main() {
    gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
precision mediump float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform vec2 uPointerVelocity;
uniform float uPointerMix;
uniform float uMobileMode;
uniform float uFlowIntensity;

const float EPSILON = 0.0025;
const int STEPS = 24;

float smoothMin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

vec3 normalizedPosition(float x, float y, float z) {
    float aspect = uResolution.x / uResolution.y;
    return vec3((x * 2.0 - 1.0) * aspect, y * 2.0 - 1.0, z);
}

float blobSdf(vec3 p, vec3 center, float radius, float seed, float flowBias) {
    vec3 localP = p - center;
    float t = uTime;

    vec2 flowVec = uPointerVelocity;
    float flowSpeed = length(flowVec);
    vec2 flowDir = flowSpeed > 0.0001 ? flowVec / flowSpeed : vec2(0.0, 1.0);
    vec2 flowNormal = vec2(-flowDir.y, flowDir.x);

    float flowAmount = (0.35 + uFlowIntensity * 0.85) * (0.6 + uPointerMix * 0.4) * flowBias;

    float rippleA =
        sin(dot(localP.xy, vec2(7.8, 6.2) + flowDir * 3.2) - t * 2.0 + seed) *
        0.012 * flowAmount;

    float rippleB =
        cos(dot(localP.xy, vec2(-5.3, 8.4) - flowNormal * 2.6) + t * 1.65 + seed * 1.4) *
        0.008 * flowAmount;

    localP.xy += flowDir * rippleA * 0.9;
    localP.xy += flowNormal * rippleB * 0.65;

    float liquidWarpX = sin(localP.y * 8.8 - t * 1.9 + seed * 0.6) * 0.0085 * flowAmount;
    float liquidWarpY = cos(localP.x * 7.2 + t * 1.7 + seed * 0.5) * 0.0065 * flowAmount;
    localP.x += liquidWarpX;
    localP.y += liquidWarpY;

    float streamStretch = dot(localP.xy, flowDir) * uFlowIntensity * 0.16;
    localP.xy += flowDir * streamStretch;

    float wobble =
        sin(localP.x * 6.5 + t * 0.75 + seed) * 0.008 +
        sin(localP.y * 7.5 - t * 0.6 + seed) * 0.006 +
        rippleA * 0.45 +
        rippleB * 0.4;

    return length(localP) - (radius + wobble);
}

vec3 applyPointerInfluence(vec3 basePos, vec3 pointerPos, float strength) {
    vec3 delta = pointerPos - basePos;
    float dist = length(delta.xy);

    float falloff = smoothstep(1.1, 0.06, dist);
    float breathing = 0.92 + sin(uTime * 1.45 + basePos.x * 2.0 + basePos.y) * 0.08;
    float fluidLag = 1.0 + uFlowIntensity * 0.28;

    return basePos + delta * falloff * strength * breathing * uPointerMix * fluidLag;
}

float sceneMap(vec3 p) {
    float t = uTime;
    float d = 100.0;
    vec3 pointerPos = normalizedPosition(uPointer.x, uPointer.y, 0.0);

    if (uMobileMode > 0.5) {
        vec3 blobA = normalizedPosition(
            0.08 + sin(t * 0.52) * 0.06 + cos(t * 0.71) * 0.016,
            0.9 + cos(t * 0.46) * 0.05 + sin(t * 0.62) * 0.016,
            0.01
        );

        vec3 blobB = normalizedPosition(
            0.95 + cos(t * 0.48) * 0.064 + sin(t * 0.64) * 0.016,
            0.6 + sin(t * 0.42) * 0.052 + cos(t * 0.57) * 0.016,
            -0.01
        );

        blobA = applyPointerInfluence(blobA, pointerPos, 0.03);
        blobB = applyPointerInfluence(blobB, pointerPos, 0.03);

        float a = blobSdf(p, blobA, 0.086 + sin(t * 0.67) * 0.006, 2.6, 1.24);
        float b = blobSdf(p, blobB, 0.082 + cos(t * 0.63) * 0.006, 3.4, 1.2);

        d = min(d, a);
        d = min(d, b);

        return d;
    }

    float blend = 0.25;

    vec3 p1 = normalizedPosition(
        0.44 + cos(t * 0.12) * 0.035,
        0.58 + sin(t * 0.17) * 0.035,
        0.02
    );

    vec3 p2 = normalizedPosition(
        0.7 + sin(t * 0.14) * 0.04,
        0.39 + cos(t * 0.16) * 0.04,
        -0.01
    );

    vec3 p3 = normalizedPosition(
        0.87 + cos(t * 0.15) * 0.035,
        0.67 + sin(t * 0.18) * 0.04,
        0.01
    );

    p1 = applyPointerInfluence(p1, pointerPos, 0.17);
    p2 = applyPointerInfluence(p2, pointerPos, 0.2);
    p3 = applyPointerInfluence(p3, pointerPos, 0.18);

    d = smoothMin(d, blobSdf(p, p1, 0.21 + cos(t * 0.24) * 0.01, 2.4, 1.0), blend);
    d = smoothMin(d, blobSdf(p, p2, 0.245 + sin(t * 0.22) * 0.012, 3.6, 1.45), blend);
    d = smoothMin(d, blobSdf(p, p3, 0.19 + sin(t * 0.28) * 0.01, 4.8, 1.08), blend);

    return d;
}

vec3 getNormal(vec3 p) {
    vec2 e = vec2(EPSILON, 0.0);

    return normalize(vec3(
        sceneMap(p + e.xyy) - sceneMap(p - e.xyy),
        sceneMap(p + e.yxy) - sceneMap(p - e.yxy),
        sceneMap(p + e.yyx) - sceneMap(p - e.yyx)
    ));
}

void main() {
    vec2 p = (gl_FragCoord.xy * 2.0 - uResolution.xy) / min(uResolution.x, uResolution.y);

    vec3 rayOrigin = vec3(p, 1.45);
    vec3 rayDirection = vec3(0.0, 0.0, -1.0);

    float totalDistance = 0.0;
    float distanceToScene = 0.0;
    bool hit = false;

    for (int i = 0; i < STEPS; i++) {
        vec3 currentPosition = rayOrigin + rayDirection * totalDistance;
        distanceToScene = sceneMap(currentPosition);

        if (distanceToScene < EPSILON) {
            hit = true;
            break;
        }

        totalDistance += distanceToScene * 0.76;

        if (totalDistance > 3.2) {
            break;
        }
    }

    if (!hit) {
        gl_FragColor = vec4(0.0);
        return;
    }

    vec3 surfacePosition = rayOrigin + rayDirection * totalDistance;
    vec3 normal = getNormal(surfacePosition);

    vec3 lightDirection = normalize(vec3(-0.72, 0.45, 1.0));
    vec3 pointerPos = normalizedPosition(uPointer.x, uPointer.y, 0.0);
    vec3 pointerLightDirection = normalize(vec3(pointerPos.xy * 0.62, 1.0));

    float diffuse = max(dot(normal, lightDirection), 0.0);
    float pointerLight = max(dot(normal, pointerLightDirection), 0.0);

    float fresnel = pow(1.0 - max(dot(normal, -rayDirection), 0.0), 2.15);
    float highlight = pow(max(dot(reflect(rayDirection, normal), lightDirection), 0.0), 15.0);
    float pointerHighlight = pow(max(dot(reflect(rayDirection, normal), pointerLightDirection), 0.0), 18.0);

    float banding = sin(surfacePosition.x * 9.5 + uTime * 0.7) * 0.5 + 0.5;
    float swirl = sin((surfacePosition.x * 7.0 - surfacePosition.y * 8.5) - uTime * 1.15) * 0.5 + 0.5;
    float innerMix = mix(banding, swirl, 0.55);
    float fluidSheen = sin(dot(surfacePosition.xy, vec2(11.5, -9.5)) + uTime * 1.75 + uFlowIntensity * 1.8) * 0.5 + 0.5;

    vec3 deepPurple = vec3(0.045, 0.01, 0.13);
    vec3 violet = vec3(0.48, 0.15, 0.96);
    vec3 amethyst = vec3(0.76, 0.32, 1.0);
    vec3 whiteRim = vec3(0.95, 0.83, 1.0);

    vec3 color = deepPurple;
    color += violet * diffuse * 0.54;
    color += amethyst * pointerLight * 0.27;
    color += amethyst * fresnel * 0.68;
    color += whiteRim * highlight * 0.76;
    color += violet * pointerHighlight * 0.36;
    color += vec3(0.29, 0.08, 0.62) * innerMix * 0.12;
    color += amethyst * fluidSheen * (0.05 + uFlowIntensity * 0.06);
    color += vec3(0.6, 0.2, 0.95) * (0.07 + fluidSheen * 0.05) * uMobileMode;

    float alpha = 0.46 + diffuse * 0.08 + fresnel * 0.24 + highlight * 0.09 + pointerLight * 0.09;
    alpha += fluidSheen * uFlowIntensity * 0.04;
    alpha += 0.03 * uMobileMode;
    alpha = clamp(alpha, 0.38, 0.8);

    gl_FragColor = vec4(color, alpha);
}
`;

function MetaballPlane({ mobileMode = false }) {
    const { gl } = useThree();

    const targetPointer = useRef(new Vector2(0.62, 0.42));
    const currentPointer = useRef(new Vector2(0.62, 0.42));
    const previousPointer = useRef(new Vector2(0.62, 0.42));
    const frameVelocity = useRef(new Vector2(0, 0));
    const currentVelocity = useRef(new Vector2(0, 0));
    const flowIntensity = useRef(0.08);

    const [uniforms] = useState(() => ({
        uTime: { value: 0 },
        uResolution: {
            value: new Vector2(gl.domElement.width, gl.domElement.height),
        },
        uPointer: {
            value: new Vector2(0.62, 0.42),
        },
        uPointerVelocity: {
            value: new Vector2(0, 0),
        },
        uPointerMix: { value: 1.0 },
        uMobileMode: { value: 0.0 },
        uFlowIntensity: { value: 0.08 },
    }));

    useEffect(() => {
        uniforms.uMobileMode.value = mobileMode ? 1.0 : 0.0;
        uniforms.uPointerMix.value = mobileMode ? 0.34 : 1.0;

        if (mobileMode) {
            targetPointer.current.set(0.5, 0.82);
            currentPointer.current.set(0.5, 0.82);
            previousPointer.current.set(0.5, 0.82);
            uniforms.uPointer.value.set(0.5, 0.82);
            uniforms.uPointerVelocity.value.set(0, 0);
            flowIntensity.current = 0.52;
            uniforms.uFlowIntensity.value = 0.52;
        } else {
            flowIntensity.current = 0.08;
            uniforms.uFlowIntensity.value = 0.08;
        }
    }, [mobileMode, uniforms]);

    useEffect(() => {
        if (mobileMode) return undefined;

        function handlePointerMove(event) {
            targetPointer.current.set(
                event.clientX / window.innerWidth,
                1 - event.clientY / window.innerHeight
            );
        }

        function handlePointerLeave() {
            targetPointer.current.set(0.62, 0.42);
        }

        window.addEventListener("pointermove", handlePointerMove, { passive: true });
        window.addEventListener("pointerleave", handlePointerLeave);

        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerleave", handlePointerLeave);
        };
    }, [mobileMode]);

    useFrame((_state, delta) => {
        uniforms.uTime.value += Math.min(delta, 0.033);

        if (mobileMode) {
            const idleX =
                0.5 +
                Math.sin(uniforms.uTime.value * 0.62) * 0.066 +
                Math.cos(uniforms.uTime.value * 0.37) * 0.018;
            const idleY =
                0.82 +
                Math.cos(uniforms.uTime.value * 0.53) * 0.072 +
                Math.sin(uniforms.uTime.value * 0.31) * 0.018;
            targetPointer.current.set(idleX, idleY);
        }

        const followStrength = mobileMode
            ? 1 - Math.exp(-delta * 3.4)
            : 1 - Math.exp(-delta * 6.2);

        currentPointer.current.lerp(targetPointer.current, followStrength);
        uniforms.uPointer.value.copy(currentPointer.current);

        frameVelocity.current.set(
            currentPointer.current.x - previousPointer.current.x,
            currentPointer.current.y - previousPointer.current.y
        );
        previousPointer.current.copy(currentPointer.current);

        const velocityLerp = mobileMode
            ? 1 - Math.exp(-delta * 3.6)
            : 1 - Math.exp(-delta * 7.0);

        currentVelocity.current.lerp(frameVelocity.current, velocityLerp);
        uniforms.uPointerVelocity.value.copy(currentVelocity.current);

        const speed = currentVelocity.current.length();
        const baseFlow = mobileMode ? 0.34 : 0.1;
        const targetFlow = Math.max(baseFlow, Math.min(speed * 40.0, 1.0));
        const flowLerp = mobileMode
            ? 1 - Math.exp(-delta * 2.5)
            : 1 - Math.exp(-delta * 5.2);

        flowIntensity.current += (targetFlow - flowIntensity.current) * flowLerp;
        uniforms.uFlowIntensity.value = flowIntensity.current;

        const width = gl.domElement.width;
        const height = gl.domElement.height;

        if (
            uniforms.uResolution.value.x !== width ||
            uniforms.uResolution.value.y !== height
        ) {
            uniforms.uResolution.value.set(width, height);
        }
    });

    return (
        <mesh>
            <planeGeometry args={[2, 2]} />
            <rawShaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
                depthWrite={false}
            />
        </mesh>
    );
}

export default function TechStackBackground3D({ mobileMode = false }) {
    return (
        <Canvas
            dpr={mobileMode ? [0.55, 0.85] : [0.65, 1]}
            gl={{
                alpha: true,
                antialias: false,
                powerPreference: "low-power",
                premultipliedAlpha: false,
            }}
            style={{
                width: "100%",
                height: "100%",
                background: "transparent",
                pointerEvents: "none",
            }}
        >
            <MetaballPlane mobileMode={mobileMode} />
        </Canvas>
    );
}
