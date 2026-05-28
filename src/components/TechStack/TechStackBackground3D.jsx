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

const float EPSILON = 0.0025;
const int STEPS = 22;

float sphereSdf(vec3 p, float radius) {
    return length(p) - radius;
}

float smoothMin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

vec3 normalizedPosition(float x, float y, float z) {
    float aspect = uResolution.x / uResolution.y;
    return vec3((x * 2.0 - 1.0) * aspect, y * 2.0 - 1.0, z);
}

float blobSdf(vec3 p, vec3 center, float radius, float seed) {
    vec3 localP = p - center;
    float t = uTime;

    float wobble =
        sin(localP.x * 6.5 + t * 0.75 + seed) * 0.008 +
        sin(localP.y * 7.5 - t * 0.6 + seed) * 0.006;

    return length(localP) - (radius + wobble);
}

vec3 applyPointerInfluence(vec3 basePos, vec3 pointerPos, float strength) {
    vec3 delta = pointerPos - basePos;
    float dist = length(delta.xy);

    float falloff = smoothstep(1.15, 0.08, dist);
    float breathing = 0.92 + sin(uTime * 1.55 + basePos.x * 2.0 + basePos.y) * 0.08;

    return basePos + delta * falloff * strength * breathing;
}

float sceneMap(vec3 p) {
    float t = uTime;
    float d = 100.0;
    float blend = 0.25;

    vec3 pointerPos = normalizedPosition(uPointer.x, uPointer.y, 0.0);

    vec3 p1 = normalizedPosition(
        0.46 + cos(t * 0.12) * 0.035,
        0.63 + sin(t * 0.17) * 0.035,
        0.02
    );

    vec3 p2 = normalizedPosition(
        0.72 + sin(t * 0.14) * 0.04,
        0.38 + cos(t * 0.16) * 0.04,
        -0.01
    );

    vec3 p3 = normalizedPosition(
        0.86 + cos(t * 0.15) * 0.035,
        0.68 + sin(t * 0.18) * 0.04,
        0.01
    );

    p1 = applyPointerInfluence(p1, pointerPos, 0.105);
    p2 = applyPointerInfluence(p2, pointerPos, 0.13);
    p3 = applyPointerInfluence(p3, pointerPos, 0.12);

    d = smoothMin(d, blobSdf(p, p1, 0.20 + cos(t * 0.24) * 0.01, 2.4), blend);
    d = smoothMin(d, blobSdf(p, p2, 0.24 + sin(t * 0.22) * 0.012, 3.6), blend);
    d = smoothMin(d, blobSdf(p, p3, 0.18 + sin(t * 0.28) * 0.01, 4.8), blend);

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

        totalDistance += distanceToScene * 0.78;

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
    vec3 pointerLightDirection = normalize(vec3(pointerPos.xy * 0.55, 1.0));

    float diffuse = max(dot(normal, lightDirection), 0.0);
    float pointerLight = max(dot(normal, pointerLightDirection), 0.0);

    float fresnel = pow(1.0 - max(dot(normal, -rayDirection), 0.0), 2.2);
    float highlight = pow(max(dot(reflect(rayDirection, normal), lightDirection), 0.0), 14.0);

    float innerFlow = sin((surfacePosition.x * 8.0 + surfacePosition.y * 6.0) - uTime * 1.05) * 0.5 + 0.5;

    vec3 deepPurple = vec3(0.055, 0.01, 0.14);
    vec3 violet = vec3(0.43, 0.12, 0.95);
    vec3 pink = vec3(0.85, 0.28, 1.0);
    vec3 whiteRim = vec3(0.95, 0.82, 1.0);

    vec3 color = deepPurple;
    color += violet * diffuse * 0.48;
    color += violet * pointerLight * 0.2;
    color += pink * fresnel * 0.72;
    color += whiteRim * highlight * 0.9;
    color += violet * innerFlow * 0.075;

    float alpha = 0.5 + fresnel * 0.22 + highlight * 0.12 + pointerLight * 0.06;

    gl_FragColor = vec4(color, alpha);
}
`;

function MetaballPlane() {
    const { gl } = useThree();

    const targetPointer = useRef(new Vector2(0.62, 0.42));
    const currentPointer = useRef(new Vector2(0.62, 0.42));

    const [uniforms] = useState(() => ({
        uTime: { value: 0 },
        uResolution: {
            value: new Vector2(gl.domElement.width, gl.domElement.height),
        },
        uPointer: {
            value: new Vector2(0.62, 0.42),
        },
    }));

    useEffect(() => {
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
    }, []);

    useFrame((_state, delta) => {
        uniforms.uTime.value += Math.min(delta, 0.033);

        currentPointer.current.lerp(
            targetPointer.current,
            1 - Math.exp(-delta * 4.0)
        );

        uniforms.uPointer.value.copy(currentPointer.current);

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

export default function TechStackBackground3D() {
    return (
        <Canvas
            dpr={[0.65, 1]}
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
            <MetaballPlane />
        </Canvas>
    );
}