import { useReactMediaRecorder } from "react-media-recorder";
import axios from 'axios';
import { useEffect, useState } from "react";
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import SendIcon from '@mui/icons-material/Send';
const VoiceRecorder = () => {
    const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({ audio: true, mimeType: 'audio/wav' });
    const [audioBlob, setAudioBlob] = useState(null);
    const [isRecording, setIsRecording]= useState(false);
    const startStopRecording=()=>{
        if(isRecording) stopRecording();
        else startRecording();
        setIsRecording(!isRecording);
    }
    useEffect(()=>{
        if(mediaBlobUrl){
            fetch(mediaBlobUrl)
                .then(res => res.blob())
                    .then(setAudioBlob)
        }
    }, [mediaBlobUrl])
    const stopAndSend = async ()=>{
        if(audioBlob){
            console.log(audioBlob);

            const formData = new FormData();
            formData.append('audio', audioBlob, 'audio.wav');
            axios.post('http://localhost:5000/api/openai/transcribe', formData,{
                headers:{'Content-Type': 'multipart/form-data'}
            }).then((response)=>{
                console.log(response);
            }).catch((err)=>{
                console.error(err);
            })
        }
    }
    return (
    <div className=" absolute flex items-center justify-center h-40 bottom-2 left-1/2 ">
    <div className="absolute  flex items-center justify-center space-x-4 p-4 rounded-2xl bg-white text-slate-800">
    
            <MicIcon 
                onClick={startStopRecording} 
                style={{ fontSize: 30, color: isRecording ? 'red' : 'black' }} 
            />
            
        <div className="absolute  p-4 text-center bg-white text-slate-800 rounded-2xl">
        <p >{status}</p>
        </div>
        <audio src={mediaBlobUrl} controls  />
        <SendIcon onClick={()=>{
            console.log('send clicked')
            stopAndSend();}} style={{ fontSize: 30 }} />
    </div>
    </div>
    );
};
export default VoiceRecorder;