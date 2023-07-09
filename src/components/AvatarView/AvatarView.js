import React from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as Tween from '@tweenjs/tween.js';

import {io} from 'socket.io-client';
const navigationBarHeight = 100
const frameDelayInMs = 1000 / 60;  // Approximately 16.67ms
const frameDelayInTicks = frameDelayInMs * 10;
const blendShapeMapping = {
    eyeBlinkLeft: 'eyeBlinkLeft',
    eyeLookDownLeft: 'eyeLookDownLeft',
    eyeLookInLeft: 'eyeLookInLeft',
    eyeLookOutLeft: 'eyeLookOutLeft',
    eyeLookUpLeft: 'eyeLookUpLeft',
    eyeSquintLeft: 'eyeSquintLeft',
    eyeWideLeft: 'eyeWideLeft',
    eyeBlinkRight: 'eyeBlinkRight',
    eyeLookDownRight: 'eyeLookDownRight',
    eyeLookInRight: 'eyeLookInRight',
    eyeLookOutRight: 'eyeLookOutRight',
    eyeLookUpRight: 'eyeLookUpRight',
    eyeSquintRight: 'eyeSquintRight',
    eyeWideRight: 'eyeWideRight',
    jawForward: 'jawForward',
    jawLeft: 'jawLeft',
    jawRight: 'jawRight',
    jawOpen: 'jawOpen',
    mouthClose: 'mouthClose',
    mouthFunnel: 'mouthFunnel',
    mouthPucker: 'mouthPucker',
    mouthLeft: 'mouthLeft',
    mouthRight: 'mouthRight',
    mouthSmileLeft: 'mouthSmileLeft',
    mouthSmileRight: 'mouthSmileRight',
    mouthFrownLeft: 'mouthFrownLeft',
    mouthFrownRight: 'mouthFrownRight',
    mouthDimpleLeft: 'mouthDimpleLeft',
    mouthDimpleRight: 'mouthDimpleRight',
    mouthStretchLeft: 'mouthStretchLeft',
    mouthStretchRight: 'mouthStretchRight',
    mouthRollLower: 'mouthRollLower',
    mouthRollUpper: 'mouthRollUpper',
    mouthShrugLower: 'mouthShrugLower',
    mouthShrugUpper: 'mouthShrugUpper',
    mouthPressLeft: 'mouthPressLeft',
    mouthPressRight: 'mouthPressRight',
    mouthLowerDownLeft: 'mouthLowerDownLeft',
    mouthLowerDownRight: 'mouthLowerDownRight',
    mouthUpperUpLeft: 'mouthUpperUpLeft',
    mouthUpperUpRight: 'mouthUpperUpRight',
    browDownLeft: 'browDownLeft',
    browDownRight: 'browDownRight',
    browInnerUp: 'browInnerUp',
    browOuterUpLeft: 'browOuterUpLeft',
    browOuterUpRight: 'browOuterUpRight',
    cheekPuff: 'cheekPuff',
    cheekSquintLeft: 'cheekSquintLeft',
    cheekSquintRight: 'cheekSquintRight',
    noseSneerLeft: 'noseSneerLeft',
    noseSneerRight: 'noseSneerRight',
    tongueOut: 'tongueOut'
    // headRoll, leftEyeRoll, and rightEyeRoll are missing from the avatar dictionary, hence they are omitted here
};

const blendShapeKeysARKit = [
    'eyeBlinkLeft',
    'eyeLookDownLeft',
    'eyeLookInLeft',
    'eyeLookOutLeft',
    'eyeLookUpLeft',
    'eyeSquintLeft',
    'eyeWideLeft',
    'eyeBlinkRight',
    'eyeLookDownRight',
    'eyeLookInRight',
    'eyeLookOutRight',
    'eyeLookUpRight',
    'eyeSquintRight',
    'eyeWideRight',
    'jawForward',
    'jawLeft',
    'jawRight',
    'jawOpen',
    'mouthClose',
    'mouthFunnel',
    'mouthPucker',
    'mouthLeft',
    'mouthRight',
    'mouthSmileLeft',
    'mouthSmileRight',
    'mouthFrownLeft',
    'mouthFrownRight',
    'mouthDimpleLeft',
    'mouthDimpleRight',
    'mouthStretchLeft',
    'mouthStretchRight',
    'mouthRollLower',
    'mouthRollUpper',
    'mouthShrugLower',
    'mouthShrugUpper',
    'mouthPressLeft',
    'mouthPressRight',
    'mouthLowerDownLeft',
    'mouthLowerDownRight',
    'mouthUpperUpLeft',
    'mouthUpperUpRight',
    'browDownLeft',
    'browDownRight',
    'browInnerUp',
    'browOuterUpLeft',
    'browOuterUpRight',
    'cheekPuff',
    'cheekSquintLeft',
    'cheekSquintRight',
    'noseSneerLeft',
    'noseSneerRight',
    'tongueOut'
  ];
export class AvatarView extends React.Component{
    mainViewRef = React.createRef()
    mixer = null;
    currentTween = null;
    currentMorphTargetIndex = undefined;
    clock = new THREE.Clock();
    audio = null;
    blendShapeIndices = {};
    async componentDidMount(){
        const mainView = this.mainViewRef.current
        this.renderer= new THREE.WebGL1Renderer({antialias: true})
        this.renderer.setSize(window.innerWidth, window.innerHeight -   navigationBarHeight)
        this.renderer.outputEncoding = THREE.sRGBEncoding
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping
        mainView.appendChild(this.renderer.domElement)
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/ (window.innerHeight), .5, 800)
        this.camera.position.set( -7,0,4.5)
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.socket = io('http://localhost:5000');
        const backgroundUrl = 'https://hallway-public.nyc3.cdn.digitaloceanspaces.com/backgrounds/venice_sunset_1k.hdr'
        const background = await this.loadBackground(backgroundUrl, this.renderer)
        this.socket.on('visemeReceived', this.handleVisemeReceived);
        this.scene = new THREE.Scene()
        this.scene.environment=background
        this.scene.background=background
        this.loadModel()
        this.renderer.setAnimationLoop(this.renderScene.bind(this))
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.socket.on('audioData', (audioDataArray) => {
            const blob = new Blob([new Uint8Array(audioDataArray)], {type: 'audio/wav'});
            const url = URL.createObjectURL(blob);
            this.audio = new Audio(url);  // ADJUSTED: Assign audio to a class member
            this.audio.onloadeddata = () => {
                this.audio.play();
            };
            this.audio.onerror = (error) => {
                console.error("Error playing audio:", error);
            };
        }); 
        
    }
    async loadModel() {
        const gltf = await this.loadGLTF(this.props.avatarUrl + '?morphTargets=mouthOpen, mouthSmile, eyesClosed, eyesLookUp, eyesLookDown,ARKit')
        this.avatar = gltf.scene.children[0];
        this.mixer = new THREE.AnimationMixer(this.avatar);
    
 
    
        this.avatar.traverse((object) => {
            if (object.isMesh && object.morphTargetDictionary) {
                console.log("dictionary :", object.morphTargetDictionary);
                console.log("influences : ", object.morphTargetInfluences)
                Object.keys(object.morphTargetDictionary).forEach(key => {
                    this.blendShapeIndices[key] = object.morphTargetDictionary[key];
                  });
            
            }
        });
    
        this.avatar.position.set(-6, -2, 3);
        this.scene.add(this.avatar);
        this.mixer = new THREE.AnimationMixer(this.avatar);
    }
    componentWillUnmount() {
        // Cleanup resources
        this.renderer.dispose();
        if (this.audioContext) {
            this.audioContext.close();
        }
        if (this.socket) {
            this.socket.close();
        }
        this.renderer.setAnimationLoop(null);
    }
    async componentDidUpdate(oldProps) {
        if(this.props?.avatarUrl && this.props?.avatarUrl !==  oldProps?.avatarUrl)  {
            this.loadModel()
        }  
        this.renderer.domElement.style.cssText = `display: ${this.props.showIFrame ? 'none' : 'block'}`
    }
    parseAnimationJson = (animationJson) => {
        // If the animationJson is not a string or is an empty string, return null
        if (typeof animationJson !== 'string' || animationJson.trim() === '') {
            return null;
        }
    
        // Try to parse the JSON and return the result
        try {
            return JSON.parse(animationJson);
        } catch (error) {
            console.error('Error parsing animation JSON:', error);
            return null;
        }
    }
    handleVisemeReceived = (visemeData) => {
      console.log('received viseme');
      const animationObject = this.parseAnimationJson(visemeData.animation);
      if (animationObject === null) {
          return;
      }
      const audioOffsetInMs = visemeData.audioOffset / 100000;
      const frameDelayInMs = 10000; // Adjust this value as needed
      animationObject.BlendShapes.forEach((blendShapeFrame, index) => {
          const delay = audioOffsetInMs + index * frameDelayInMs;
          setTimeout(() => this.animateViseme(blendShapeFrame), delay);
      });
  }
  
  animateViseme(blendShapeFrame) {
    const tweenDuration = 130; // Duration of the blend shape transition (in milliseconds)
    const targetInfluences = []; // Array to store the target blend shape influences
  
    // Traverse the avatar object
    this.avatar.traverse((object) => {
      if (object.isMesh && object.morphTargetDictionary) {
        // Iterate through the blendShapeFrame array
        blendShapeFrame.forEach((value, index) => {
          // Get key from ARKit
          const key = blendShapeKeysARKit[index];
  
          // Check if the key exists in the avatar's morphTargetDictionary
          if (this.blendShapeIndices[key] !== undefined) {
            // Get index from cached blendShapeIndices
            const targetIndex = this.blendShapeIndices[key];
            // Get the current influence value for the blend shape
            const currentInfluence = object.morphTargetInfluences[targetIndex];
  
            // Create a target influence object to be tweened
            const targetInfluence = { value: currentInfluence };
  
            // Create a tween to gradually transition between the current influence and the target influence
            new Tween.Tween(targetInfluence)
              .to({ value: value }, tweenDuration)
              .easing(Tween.Easing.Quadratic.Out)
              .onUpdate(() => {
                // Update the blend shape influence during the tween
                object.morphTargetInfluences[targetIndex] = targetInfluence.value;
              })
              .start();
  
            // Store the target influence object in the targetInfluences array
            targetInfluences.push(targetInfluence);
          } else {
            console.warn(`Blendshape '${key}' not found in avatar dictionary.`);
          }
        });
      }
    });
  
    // Start the TWEEN animation loop
    function animate() {
      if (targetInfluences.length > 0) {
        requestAnimationFrame(animate);
        Tween.update();
      }
    }
    animate();
  }
      
    
    renderScene() {
        const delta = this.clock.getDelta();
        if (this.mixer) {
            this.mixer.update(delta);
        }
    
        // Update Tweens
        Tween.update();
    
        this.renderer.render(this.scene, this.camera);
    }
    loadGLTF(url) {
        return new Promise((resolve) => {
          const loader = new GLTFLoader()
          loader.load(url, (gltf) => resolve(gltf))
        })
      }
    loadBackground(url, renderer) {
        return new Promise((resolve) => {
        const loader = new RGBELoader()
        const generator = new THREE.PMREMGenerator(renderer)
        loader.load(url, (texture) => {
            const envMap = generator.fromEquirectangular(texture).texture
            generator.dispose()
            texture.dispose()
            resolve(envMap)
        })
        })
    }

  
    render=()=>(
        <div
            ref={this.mainViewRef}
            className="avatarView"
           
        />
    )
}