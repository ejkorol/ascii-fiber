import * as THREE from "three";
import { useEffect, useState, useRef } from "react";
import { useThree, Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { AsciiRenderer } from "@react-three/drei";

export const ThreeCanvas = () => {
  return (
    <Canvas className="canvas">
      <EffectComposer>
        <AsciiRenderer fgColor="white" bgColor="black" />
      </EffectComposer>
      <color attach="background" args={["black"]} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />
      <Torusknot />
    </Canvas>
  );
};

function Torusknot(props: any) {
  const ref = useRef<any>();
  const viewport = useThree((state) => state.viewport);
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const handleMouse = (event: MouseEvent) => {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -(event.clientY / window.innerHeight) * 2 + 1;
    setPosition({ x, y });
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouse);
    return () => {
      window.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  useFrame(() => {
    if (ref.current) {
      const targetX = position.y * Math.PI * 0.5;
      const targetY = position.x * Math.PI * 0.5;

      ref.current.rotation.x = THREE.MathUtils.lerp(
        ref.current.rotation.x,
        targetX,
        0.1,
      );
      ref.current.rotation.y = THREE.MathUtils.lerp(
        ref.current.rotation.y,
        targetY,
        0.1,
      );
    }
  });

  return (
    <mesh
      scale={Math.min(viewport.width, viewport.height) / 5}
      {...props}
      ref={ref}
    >
      <torusKnotGeometry args={[1, 0.2, 128, 32]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
}
