import { Box, OrbitControls, Text, useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RigidBody, quat } from "@react-three/rapier";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { Controls } from "../App";

export const Experience = () => {
  const cube = useRef();
  const box = useRef();
  const kicker = useRef();
  const [start, setStart] = useState(false);
  const [timer, setTimer] = useState(0);
  const [color, setColor] = useState(false);
  const isOnFloor = useRef();
  const [highScore, setHighScore] = useState(null);

  const jump = () => {
    if (isOnFloor.current) {
      cube.current.applyImpulse({ x: 0, y: 5, z: 0 });
      isOnFloor.current = false;
    }
  };

  const { jumpPressed, forwardPressed, backwardPressed, leftPressed, rightPressed } = useKeyboardControls(state => ({
    jumpPressed: state[Controls.jump],
    forwardPressed: state[Controls.forward],
    backwardPressed: state[Controls.backward],
    leftPressed: state[Controls.left],
    rightPressed: state[Controls.right]
  }));

  const movement = () => {
    if (!isOnFloor.current) {
      return;
    }
    if (forwardPressed) {
      cube.current.applyImpulse({ x: 0, y: 0, z: -0.1 });
    }
    if (backwardPressed) {
      cube.current.applyImpulse({ x: 0, y: 0, z: 0.1 });
    }
    if (rightPressed) {
      cube.current.applyImpulse({ x: 0.1, y: 0, z: 0 });
    }
    if (leftPressed) {
      cube.current.applyImpulse({ x: -0.1, y: 0, z: 0 });
    }
  };

  const speed = useRef(1);

  useEffect(() => {
    const savedTime = parseFloat(localStorage.highScore);
    if (!isNaN(savedTime)) {
      setHighScore(savedTime.toFixed(1));
    }
  }, []);
  useFrame((_state, delta) => {
    movement();
    if (jumpPressed) {
      jump();
    }
    if (cube.current.translation().y < -2.5 && start) {
      setStart(false);
      const savedTime = parseFloat(localStorage.highScore);
      if (isNaN(savedTime) || timer > savedTime) {
        localStorage.setItem("highScore", timer.toFixed(1));
        setHighScore(timer.toFixed(1));
      }
    }
    if (start) {
      setTimer(prevTime => prevTime + delta);
      const rotation = quat(kicker.current.rotation());
      const newRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), delta * speed.current);
      rotation.multiply(newRotation);
      kicker.current.setNextKinematicRotation(rotation);
      speed.current += 0.005;
    }
  });

  return (
    <>
      <Text position={[0, 2.5, 0]} onClick={() => setStart(true)}>{start ? `Time: ${timer.toFixed(2)}s` : "Click to start"}</Text>
      {highScore && <Text position={[0, 5, 0]} color={"red"}>{`High Score: ${highScore}s`}</Text>}
      <OrbitControls />
      <ambientLight intensity={0.5} />

      <RigidBody ref={cube}
        onCollisionEnter={({ other }) => {
          if (other.rigidBodyObject.name === "Floor") {
            isOnFloor.current = true;
            setColor(!color);
          }
        }}
        onCollisionExit={({ other }) => {
          if (other.rigidBodyObject.name === "Floor") {
            isOnFloor.current = false;
            setColor(!color);
          }
        }}
      >
        <Box ref={box} position={[-2, 3, 0]} args={[1, 1, 1]} onPointerUp={()=> jump()} onClick={() => jump()}>
          <meshBasicMaterial color={"Gold"} />
        </Box>
      </RigidBody>

      <RigidBody type="kinematicPosition" position={[0, 0.75, 0]} ref={kicker}>
        <group>
          <Box position={[2.5, 0, 0]} args={[5, 0.5, 0.5]}>
            <meshBasicMaterial color={"#402F1D"} />
          </Box>
        </group>
      </RigidBody>

      <RigidBody type="fixed" name="Floor">
        <Box args={[10, 1, 10]}>
          <meshBasicMaterial color={color ? "black" : "green"} />
        </Box>
      </RigidBody>
    </>
  );
};
