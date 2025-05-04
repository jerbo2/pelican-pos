import { useEffect } from 'react';
import { Dispatch, createContext, useState, SetStateAction } from 'react';
import axios from 'axios';
import qs from 'qs';

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
    authValid: boolean | null;
    setAuthValid: Dispatch<SetStateAction<boolean>>;
    authChecked: boolean;
    setAuthChecked: Dispatch<SetStateAction<boolean>>;
    login: (credentials: Credentials) => Promise<void>;
    logout: () => void;
    getUser: () => Promise<void>;
    badPassword: boolean;
}>({
    user: null,
    setUser: () => null,
    authValid: null,
    setAuthValid: () => null,
    authChecked: false,
    setAuthChecked: () => null,
    login: async () => {},
    logout: () => null,
    getUser: async () => {},
    badPassword: false,
});

const UserProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [authValid, setAuthValid] = useState(false);
    const [badPassword, setBadPassword] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        getUser();
    }, []);

    const login = async (credentials: { username: string, password: string }) => {
        try {
            await axios.post(
                '/token',
                qs.stringify(credentials),
                {
                    headers: {
                        'accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );
            setBadPassword(false);
        } catch (error) {
            console.error('Error logging in:', error);
            setBadPassword(true);
        }
    };

    const getUser = async () => {
        try {
            const response = await axios.get('/users/me');
            setUser(response.data);
            setAuthValid(true);
        } catch (error) {
            console.error('Error getting user:', error);
            setAuthValid(false);
        }
        setAuthChecked(true);
    }

    const logout = async () => {
        try {
            await axios.post('/logout');
            setAuthValid(false);
            setUser(null);
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <UserContext.Provider value={{ user, setUser, authValid, setAuthValid, authChecked, setAuthChecked, login, logout, getUser, badPassword }}>
            {children}
        </UserContext.Provider>
    );
};

export { UserContext, UserProvider };
