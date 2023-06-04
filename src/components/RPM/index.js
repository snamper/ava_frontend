import React from 'react'
import {Avatar} from '@readyplayerme/visage'
import './index.css'
import { Canvas } from '@react-three/fiber'
import { Experience } from './Experience'

function index() {
  return (
    
    <Canvas shadows camera={{position: [0.9,0.5, 4.5], fov: 20}}>
      <color attach="background" args={["#ececec"]} />
      <Experience /> 
    </Canvas>  )
}

export default index