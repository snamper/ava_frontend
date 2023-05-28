import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register'
import VoiceRecorder from './components/VoiceRecorder';
function App() {
  return (
    <Router>
    <Routes>
      <Route path='/' exact element={<Home/>}/>
      {/* <Route path='/login' exact element={Login}/> */}
      {/* <Route path='/register' exact element={Register}/> */}
      {/* 404 page ? */}
      
    </Routes>
    </Router>
  );
}

export default App;
