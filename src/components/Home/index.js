import React from 'react'
import VoiceRecorder from '../VoiceRecorder'
import RPM from '../RPM'
function index() {
  return (
    <div className=' min-h-screen text-white'>
    <VoiceRecorder />
    <RPM />
    {/* <VoiceRecorder /> */}
    </div>
  )
}

export default index