import { useReactMediaRecorder } from "react-media-recorder";
import axios from 'axios';
import { useEffect, useState } from "react";

const VoiceRecorder = () => {
    const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({ audio: true, mimeType: 'audio/wav' });
    const [audioBlob, setAudioBlob] = useState(null);

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
    <div>
        <p>{status}</p>
        <button onClick={startRecording}>Start Recording</button>
        <button onClick={stopRecording}>Stop Recording</button>
        <button onClick={stopAndSend}>Send Recording</button>
        <audio src={mediaBlobUrl} controls  />
    </div>
    );
};
export default VoiceRecorder;