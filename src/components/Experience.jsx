import { Box, OrbitControls, Sphere, useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RigidBody, quat } from "@react-three/rapier";
import { useRef, useState } from "react";
import * as THREE from "three"
import { Controls } from "../App";

export const Experience = () => {

  const [hover, sethover] = useState(false)
  const cube = useRef()
  const kicker = useRef()
  const [start, setStart] = useState(false)
  const isOnFLoor = useRef(true)
  const jump = ()=> {
    if(isOnFLoor.current) {
    cube.current.applyImpulse({x: 0, y:5, z: 0})
    isOnFLoor.current = false
  }}
const jumpPressed = useKeyboardControls((state)=> state[Controls.jump])
const forwardPressed = useKeyboardControls((state)=> state[Controls.forward])
const backwardPressed = useKeyboardControls((state)=> state[Controls.backward])
const leftPressed = useKeyboardControls((state)=> state[Controls.left])
const rightPressed = useKeyboardControls((state)=> state[Controls.right])
const movement = () => {
  if(!isOnFLoor.current){
    return
  }
  if(forwardPressed){
    cube.current.applyImpulse({x: 0, y:0, z: -0.1})
  }
  if(backwardPressed){
    cube.current.applyImpulse({x: 0, y:0, z: 0.1})
  }
  if(rightPressed){
    cube.current.applyImpulse({x: 0.1, y:0, z: 0})
  }
  if(leftPressed){
    cube.current.applyImpulse({x: -0.1, y:0, z: 0})
  }
}
const speed = useRef(1)
useFrame((_state, delta)=>{
  movement()
  if(jumpPressed){
    jump()
  }
  if(!start){
    return
  }
  const rotation = quat(kicker.current.rotation())
  const newRotation = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(0,1,0), 
    delta * speed.current
  )
    rotation.multiply(newRotation)
    kicker.current.setNextKinematicRotation(rotation)
    speed.current += delta
})
  return (
    <>
      <OrbitControls />
      <ambientLight intensity={0.5} />

      {/* <RigidBody colliders={"ball"}  ref={cube}>
      <Sphere position={[0,10,0]} onPointerEnter={()=>sethover(true)} onPointerLeave={()=>sethover(false)} onClick={jump}>
        <meshBasicMaterial color={hover? "Pink": "Gold"} />
        </Sphere>
      </RigidBody> */}
      
      <RigidBody ref={cube} 
      onCollisionEnter={({other})=>{ 
        if(other.rigidBodyObject.name === "Floor"){
          isOnFLoor.current = true;
        }
      }}
      onCollisionLeave={({other})=>{ 
        if(other.rigidBodyObject.name === "Floor"){
          isOnFLoor.current = false;
        }
      }}
      >
      <Box position={[-2,3,0]} args={[1,1,1]} onPointerEnter={()=>sethover(true)} onPointerLeave={()=>sethover(false)} onClick={()=>setStart(true)}>
        <meshBasicMaterial color={hover? "Pink": "Gold"} />
        </Box>
      </RigidBody>

      <RigidBody type="kinematicPosition" position={[0,0.75,0]} ref={kicker}>
        <group>
      <Box position={[2.5,0,0]} args={[5,0.5,0.5]}>
        <meshBasicMaterial color={"#402F1D"} />
        </Box>
        </group>
      </RigidBody>

      <RigidBody type="fixed"  name="Floor">
      <Box args={[10,1,10]}>
        <meshBasicMaterial color={"green"} />
        </Box>
      </RigidBody>
    </>
  );
};
