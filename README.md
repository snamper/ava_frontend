# AvatarView Project
React application that imitates a virtual chat with a 3D Ready Player Me avatar (RPM) with help of the following APIs:
- Openai Whisper API: transcription of audio recording
- Openai ChatGPT API:  genrative AI responses to transcribed text
- Microsoft-speeh-SDK: audio synthesis & viweme data for animation
- Ready Player Me FrameAPI: 3D avatars & Audio-to-Face animations

## Features
- Accepts audio using React Media Recorder
- Transcribes audio using Openai Whisper API
- Feeds response of ChatGPT API into Microsoft-speech-sdk in order to receive synthesized audio of the response and viseme data.
- Renders 3D RPM avatar in GLTF fromat using Three.js
- Utlizes Blendshapes animations and audio offset objects provided by Microsoft-speech-sdk to drive Lib-Sync animations.

## Back-end project:
Please review the back-end component of this project at [Link].

## Prerequisites 
- To run the project, ensure to clone and follow steps for back-end project.
- Node V16.16.0
- NPM   V9.6.6

## Getting Started
Follow these steps to get the project running locally:
1. Creat project directory that will contain both front-end and back-end projects.
2. Clone the front-end project after clonning back-end project.
`git clone https://github.com/3bdrahman/ava_frontend.git`.
3. run `npm install` in both project folders back-end and front-end.
4. refer to back-end documentation regarding environment variables / API keys.
5. inside back-end project folder run `npm run dev`.
