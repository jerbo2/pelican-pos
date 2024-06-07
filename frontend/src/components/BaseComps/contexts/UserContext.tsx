import { useEffect } from 'react';
import { Dispatch, createContext, useState, SetStateAction } from 'react';
import axios from 'axios';
import qs from 'qs';
import { useNavigate, useLocation } from 'react-router-dom';

interface User {
    id: number;
    username: string;
    disabled: boolean;
    is_admin: boolean;
}

interface Credentials {
    username: string;
    password: string;
}


const UserContext = createContext<{
    user: User | null;
    setUser: Dispatch<SetStateAction<User | null>>;
    token: string | null;
    setToken: Dispatch<SetStateAction<string | null>>;
    login: (credentials: Credentials) => void;
    logout: () => void;
    getUser: () => void;
    badPassword: boolean;
}>({
    user: null,
    setUser: () => null,
    token: null,
    setToken: () => null,
    login: () => null,
    logout: () => null,
    getUser: () => null,
    badPassword: false,
});

const UserProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [badPassword, setBadPassword] = useState(false);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            getUser();
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

    const login = async (credentials: { username: string, password: string }) => {
        try {
            const response = await axios.post(
                '/api/v1/token',
                qs.stringify(credentials),
                {
                    headers: {
                        'accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );
            setToken(response.data.access_token);
            setBadPassword(false);
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
        } catch (error) {
            console.error('Error logging in:', error);
            setBadPassword(true);
        }
    };

    const getUser = async () => {
        if (!token) return;
        try {
            const response = await axios.get('/api/v1/users/me');
            setUser(response.data);
            localStorage.setItem('admin', response.data.is_admin)
        } catch (error) {
            console.error('Error getting user:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('admin');
            setToken(null);
        }
    }

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, setUser, token, setToken, login, logout, getUser, badPassword }}>
            {children}
        </UserContext.Provider>
    );
};

export { UserContext, UserProvider };
