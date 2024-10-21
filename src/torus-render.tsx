import { useState, useRef } from "react";
import {
  ThreeEvent,
  useThree,
  Canvas,
  useLoader,
  useFrame,
} from "@react-three/fiber";
import { Text, Environment, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useControls } from "leva";
import {
  Bloom,
  DepthOfField,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

const ThreeCanvas = () => {
  return (
    <Canvas
      style={{ backgroundColor: "black", position: "absolute" }}
      gl={{
        powerPreference: "high-performance",
        alpha: false,
        antialias: true,
        stencil: false,
        depth: true,
      }}
    >
      <directionalLight intensity={3} position={[0, 5, 3]} />
      <Environment preset="studio" />
      <EffectComposer multisampling={4}>
        <DepthOfField
          focusDistance={0}
          focalLength={0.2}
          bokehScale={4}
          height={480}
        />
        <Bloom luminanceThreshold={0.4} luminanceSmoothing={0.9} height={300} />
        <Noise opacity={0.2} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>

      <Model />
      <TestModel />
    </Canvas>
  );
};

const TestModel = () => {
  const gltf = useLoader(GLTFLoader, "/assets/test.gltf");
  const gltfRef = useRef<THREE.Group | null>(null);

  useFrame(() => {
    if (gltfRef.current) {
      gltfRef.current.rotation.y += 0.01;
      gltfRef.current.rotation.x += 0.01;
    }
  });

  return <primitive ref={gltfRef} object={gltf.scene} scale={100} />;
};

const Model = () => {
  const meshRef = useRef<THREE.Mesh | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [mousePosition, setMousePosition] = useState<THREE.Vector2>(
    new THREE.Vector2(),
  );
  const [velocity, setVelocity] = useState<THREE.Vector2>(
    new THREE.Vector2(0, 0),
  );

  const torus = new THREE.TorusGeometry(1, 0.4, 12, 48, Math.PI * 2);
  const { viewport } = useThree();

  useFrame(() => {
    if (meshRef.current) {
      if (!isDragging && velocity.length() > 0.001) {
        meshRef.current.rotation.y += velocity.x;
        meshRef.current.rotation.x += velocity.y;

        setVelocity(velocity.multiplyScalar(0.95));
      } else if (!isDragging && velocity.length() <= 0.001) {
        meshRef.current.rotation.y += 0.01;
      }
    }
  });

  const materialProps = useControls({
    thickness: { value: 0.35, min: 0, max: 3, step: 0.05 },
    roughness: { value: 0, min: 0, max: 1, step: 0.1 },
    transmission: { value: 1, min: 0, max: 3, step: 0.1 },
    ior: { value: 0.8, min: 0, max: 3, step: 0.1 },
    chromaticAberration: { value: 0.33, min: 0, max: 1 },
    backside: { value: true },
    opacity: { value: 1, min: 0, max: 1, step: 0.01 },
    metalness: { value: 0, min: 0, max: 1, step: 0.01 },
  });

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    setIsDragging(true);
    setMousePosition(new THREE.Vector2(event.clientX, event.clientY));
    setVelocity(new THREE.Vector2(0, 0));
    event.stopPropagation();
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!isDragging || !meshRef.current) return;
    const deltaX = (event.clientX - mousePosition.x) * 0.01;
    const deltaY = (event.clientY - mousePosition.y) * 0.01;

    if (meshRef.current) {
      meshRef.current.rotation.x += deltaX;
      meshRef.current.rotation.y += deltaY;

      setVelocity(new THREE.Vector2(deltaX * 0.01, deltaY * 0.01));

      setMousePosition(new THREE.Vector2(event.clientX, event.clientY));
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <group scale={viewport.width / 10}>
      <Text fontSize={1} font="/fonts/geist.ttf" position={[0, 0, -2]}>
        React Fiber Test
      </Text>
      <mesh
        ref={meshRef}
        geometry={torus}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerUp}
      >
        <MeshTransmissionMaterial color="#bdbdbd" {...materialProps} />
      </mesh>
    </group>
  );
};

export default ThreeCanvas;
