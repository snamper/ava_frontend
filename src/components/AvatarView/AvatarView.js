import React from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as Tween from '@tweenjs/tween.js';

import {io} from 'socket.io-client';const navigationBarHeight = 100
const SCALE = 7.5
const visemeMapping = {
    0: 'viseme_sil', // Silence
    1: 'viseme_E', // æ, ə, ʌ
    2: 'viseme_aa', // ɑ
    3: 'viseme_O', // ɔ
    4: 'viseme_E', // ɛ, ʊ
    5: 'viseme_RR', // ɝ
    6: 'viseme_I', // j, i, ɪ
    7: 'viseme_U', // w, u
    8: 'viseme_O', // o
    9: 'viseme_aa', // aʊ
    10: 'viseme_O', // ɔɪ
    11: 'viseme_aa', // aɪ
    12: 'viseme_E', // h
    13: 'viseme_RR', // ɹ
    14: 'viseme_E', // l
    15: 'viseme_SS', // s, z
    16: 'viseme_CH', // ʃ, tʃ, dʒ, ʒ
    17: 'viseme_TH', // ð
    18: 'viseme_FF', // f, v
    19: 'viseme_DD', // d, t, n, θ
    20: 'viseme_kk', // k, g, ŋ
    21: 'viseme_PP', // p, b, m
    22: 'viseme_nn',
    23: 'mouthOpen',
    24: 'mouthSmile',
    25: 'eyesClosed',
    26: 'eyesLookUp',
    27: 'eyesLookDown'
};
export class AvatarView extends React.Component{
    mainViewRef = React.createRef()
    state = {
        visemeInfluences: new Array(28).fill(0), // 28 is the new number of visemes and blend shapes
        morphTargets: {} 
    }
    clock = new THREE.Clock();
    mixer = null;
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
        this.socket.on('audioData', (audioData) => {
            const blob = new Blob([audioData], {type: 'audio/wav'});
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audio.onloadeddata = () => {
                console.log('playing audio');
                audio.play();
            };
            audio.onerror = (error) => {
                console.error("Error playing audio:", error);
            };
        });
        
        
      
        
        
    }
    async loadModel() {
        const gltf = await this.loadGLTF(this.props.avatarUrl + '?morphTargets=mouthOpen,eyesClosed,eyesLookUp,mouthSmile,eyesLookDown,Oculus Visemes')
        this.avatar = gltf.scene.children[0];
        this.mixer = new THREE.AnimationMixer(this.avatar);
    
        this.avatar.traverse((object) => {
            if (object.isMesh && object.morphTargetDictionary) {
                // const morphTargetIndex = object.morphTargetDictionary["viseme_nn"]; // Try a different morph target
                // if (morphTargetIndex !== undefined) {
                //     object.morphTargetInfluences[morphTargetIndex] = 1;
                // }
                console.log("dictionary :", object.morphTargetDictionary);
                console.log("influences : ", object.morphTargetInfluences)
            }
        });
        
        this.avatar.position.set(-6, -2, 3);
        this.scene.add(this.avatar);
    }
    async componentDidUpdate(oldProps) {
        if(this.props?.avatarUrl && this.props?.avatarUrl !==  oldProps?.avatarUrl)  {
            this.loadModel()
        }  
        this.renderer.domElement.style.cssText = `display: ${this.props.showIFrame ? 'none' : 'block'}`
    }
    handleVisemeReceived = (viseme) => {
        var delay = viseme.audioOffset / 1000000;
        setTimeout(() => {
            this.animateViseme(viseme);
        }, delay);
    }
    
    
    updateMorphTargetInfluences() {
        this.avatar.traverse((object) => {
            if (object.isMesh && object.morphTargetDictionary) {
                // Gradually interpolate the morph target influences
                for (let i = 0; i < object.morphTargetInfluences.length; i++) {
                    object.morphTargetInfluences[i] += (this.state.visemeInfluences[i] - object.morphTargetInfluences[i]) * 0.1;
                }
            }
        });
    }
    base64ToArrayBuffer(base64){
        const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
    }
    animateViseme(viseme) {
        console.log('Applying viseme:', viseme);
    
        // Get the morph target name based on the viseme id
        const morphTargetName = visemeMapping[viseme.visemeId];
    
        this.avatar.traverse((object) => {
            if (object.isMesh && object.morphTargetDictionary) {
                // Reset all the viseme morph targets to 0
                for (let morphTarget in object.morphTargetDictionary) {
                    if (morphTarget.startsWith("viseme_") || 
                        morphTarget === "mouthOpen" || 
                        morphTarget === "mouthSmile" || 
                        morphTarget === "eyesClosed" ||
                        morphTarget === "eyesLookUp" ||
                        morphTarget === "eyesLookDown") {
                        let index = object.morphTargetDictionary[morphTarget];
                        object.morphTargetInfluences[index] = 0;
                    }
                }
    
                // Only apply viseme if it exists in the morph target dictionary
                const morphTargetIndex = object.morphTargetDictionary[morphTargetName];
                if (morphTargetIndex !== undefined) {
                    const from = { influence: object.morphTargetInfluences[morphTargetIndex] };
                    const to = { influence: 1 };
                    const tween = new Tween.Tween(from)
                        .to(to, viseme.audioOffset) // Adjust duration as needed
                        .easing(Tween.Easing.Quadratic.InOut)
                        .onUpdate(() => {
                            object.morphTargetInfluences[morphTargetIndex] = from.influence;
                        })
                        .start(); // Start the Tween
                }
            }
        });
    }
    
    
    
    
renderScene(){
    const delta = this.clock.getDelta();
    if (this.mixer) {
        this.mixer.update(delta);
    }

    // Update Tweens
    Tween.update();

    // Render the scene
    this.renderer.render(this.scene, this.camera)
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

     object3DChildNames = (object, name, {recursive = false}={}) =>{
        if(!recursive){
            return Object.children.find(child => child.name === name);
        }
        for(const child of object.children){
            if(child.name === name) return child;
            if(child.children.length > 0){
                const found = this.object3DChildNames(child, name, {recursive});
                if(found) return found;
            }
        }
        return undefined
    }
    render=()=>(
        <div
            ref={this.mainViewRef}
            className="avatarView"
           
        />
    )
}