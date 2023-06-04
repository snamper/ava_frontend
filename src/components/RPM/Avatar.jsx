import React, {useEffect, useRef, useState} from 'react'
import { useFBX, useGLTF } from '@react-three/drei'
import {useFrame} from '@react-three/fiber'
import {io} from 'socket.io-client';
export function Avatar(props) {
  const { nodes, materials } = useGLTF('models/avatar.glb')
  const [speaking, setSpeaking] = useState(false);
  const headRef = React.useRef()
  const teethRef = React.useRef()
  useFrame(({ clock }) => {
    
    if(!speaking) return;
    console.log('animating')
    const speedFactor = 7;  // Increase this to make the animation faster
    const amplitude = 0.2;  // Adjust how much the mouth opens
    const mouthOpenValue = Math.sin(clock.getElapsedTime() * speedFactor) * amplitude + amplitude;
    if (headRef.current) headRef.current.morphTargetInfluences[headRef.current.morphTargetDictionary.mouthOpen] = mouthOpenValue
    if (teethRef.current) teethRef.current.morphTargetInfluences[teethRef.current.morphTargetDictionary.mouthOpen] = mouthOpenValue
  })
  useEffect(() => {
    console.log(`Speaking state changed: ${speaking}`);
  }, [speaking]);
  useEffect(() => {
    // establish a socket connection
    const socket = io('http://localhost:3001');
  
    // when the 'speaking' event is received, update the state
    socket.on('speaking', (isSpeaking) => {
      setSpeaking(isSpeaking);
    });
      // clean up the effect
    return () => socket.disconnect();
  }, []);
  return (
    <group {...props} dispose={null}>
      <primitive object={nodes.Hips} />
      <skinnedMesh geometry={nodes.Wolf3D_Body.geometry} material={materials.Wolf3D_Body} skeleton={nodes.Wolf3D_Body.skeleton} />
      <skinnedMesh geometry={nodes.Wolf3D_Outfit_Bottom.geometry} material={materials.Wolf3D_Outfit_Bottom} skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton} />
      <skinnedMesh geometry={nodes.Wolf3D_Outfit_Footwear.geometry} material={materials.Wolf3D_Outfit_Footwear} skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton} />
      <skinnedMesh geometry={nodes.Wolf3D_Outfit_Top.geometry} material={materials.Wolf3D_Outfit_Top} skeleton={nodes.Wolf3D_Outfit_Top.skeleton} />
      <skinnedMesh geometry={nodes.Wolf3D_Hair.geometry} material={materials.Wolf3D_Hair} skeleton={nodes.Wolf3D_Hair.skeleton} />
      <skinnedMesh name="EyeLeft" geometry={nodes.EyeLeft.geometry} material={materials.Wolf3D_Eye} skeleton={nodes.EyeLeft.skeleton} morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary} morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences} />
      <skinnedMesh name="EyeRight" geometry={nodes.EyeRight.geometry} material={materials.Wolf3D_Eye} skeleton={nodes.EyeRight.skeleton} morphTargetDictionary={nodes.EyeRight.morphTargetDictionary} morphTargetInfluences={nodes.EyeRight.morphTargetInfluences} />
      <skinnedMesh ref={headRef} name="Wolf3D_Head" geometry={nodes.Wolf3D_Head.geometry} material={materials.Wolf3D_Skin} skeleton={nodes.Wolf3D_Head.skeleton} morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary} morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences} />
      <skinnedMesh ref={teethRef} name="Wolf3D_Teeth" geometry={nodes.Wolf3D_Teeth.geometry} material={materials.Wolf3D_Teeth} skeleton={nodes.Wolf3D_Teeth.skeleton} morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary} morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences} />
    </group>
  )
}

useGLTF.preload('models/avatar.glb')