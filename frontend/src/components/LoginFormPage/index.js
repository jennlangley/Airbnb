import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as sessionActions from '../../store/session';
import { Redirect } from "react-router-dom";
import './LoginForm.css';

const LoginFormPage = () => {
    const dispatch = useDispatch();
    const sessionUser = useSelector(state => state.session.user);
    const [credential, setCredential] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
   
    if (sessionUser) return <Redirect to='/' />;
    
    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        return dispatch(sessionActions.setSession({
            credential: credential,
            password: password
        })).catch(
            async (res) => {
                const data = await res.json();
                if (data && data.errors) setErrors(data.errors);
            }
        );
    };

    return (
        <>
            <h1>Log in</h1>
            <form
            onSubmit={handleSubmit}
            >
                <label>Username or Email
                    <input
                    placeholder="Username or Email"
                    type='text'
                    value={credential}
                    onChange={e => setCredential(e.target.value)}
                    required
                    />
                </label>
                <label>Password
                    <input
                    type='password'
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    />
                </label>
                {errors.credential && <p>{errors.credential}</p>}
                <button className="loginButton" type='submit'>Log In</button>
            </form>
        </>
    );
};

export default LoginFormPage;