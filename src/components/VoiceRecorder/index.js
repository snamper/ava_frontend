import React, {useState, useRef} from 'react';

const VoiceRecorder=()=>{
    const [recording, setRecording] = useState(false);
    const [audioUrl, SetAudioUrl] = useState('');
    const audioChunks = useRef([]);
    const mediaRecorder = useRef(null);

    const startRecording = async() => {
        const stream = await navigator.mediaDevices.getUserMedia({audio: true});
        mediaRecorder.current = new MediaRecorder(stream);
        mediaRecorder.current.addEventListener('dataavailable', (e)=>{
            audioChunks.current.push(e.data);
        });

        mediaRecorder.addEventListener('stop', ()=>{
            const audioBlob = new Blob(audioChunks.current);
            SetAudioUrl(URL.createObjectURL(audioBlob));
            // send to server
        });
        setRecording(true);
        mediaRecorder.current.start();
    };

    const stopRecording = () => {
        setRecording(false);
        mediaRecorder.current.stop();
    }

    return(
        <div>
            <button onClick={startRecording} disabled={recording}>
                Start Recording
            </button>
            <button onClick={stopRecording} disabled={!recording}>
                Stop Recording
            </button>
            <audio src={audioUrl} controls />
        </div>
    )
}
export default VoiceRecorder;