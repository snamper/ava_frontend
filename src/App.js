import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register'
function App() {
  return (
    <Router>
    <Switch>
      <Route path='/' exact Component={Home}/>
      <Route path='/login' exact Component={Login}/>
      <Route path='/register' exact Component={Register}/>
      {/* 404 page ? */}
      
    </Switch>
    </Router>
  );
}

export default App;
