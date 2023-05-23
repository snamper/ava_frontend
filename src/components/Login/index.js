import React, {useState} from "react";
import axios from 'axios';

const Login = () =>{
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState(''); 

    const handleSubmit = async e => {
        e.preventDefault();
        const payload = {
            username,
            password
        };
        const response = await axios.post('/api/user/login', payload);
    };
    return(
        <form onSubmit={handleSubmit}>
            <input type="text" value={username} onChange={e => setUsername(e.ta
            .value)} placeholder="Username"/>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"/>
            <button type="submit">Log in</button>
        </form>
    )
}