
import React, { useContext, useEffect, useState } from "react";
import { ButtonWidest, Divider, MenuItemSmaller, TextFieldSmaller } from "./Styled";
import axios from "axios";
import { UserContext } from "./BaseComps/contexts/UserContext";
import { Box, Paper, Stack } from "@mui/material";
import Logo from "./BaseComps/Logo";
import { useLocation, useNavigate } from "react-router";

interface User {
    id: number;
    username: string;
}

export default function Login() {
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const { login, getUser, badPassword } = useContext(UserContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleGetAvailableUsers = async () => {
        try {
            const res = await axios.get('/api/v1/users/');
            setAvailableUsers(res.data);
        } catch (error) {
            console.error(error);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
    };

    useEffect(() => {
        handleGetAvailableUsers();
    }, []);

    useEffect

    const handleSubmit = async () => {
        await login(credentials);
        await getUser();
        navigate(location.state?.from ? location.state.from : '/');
    }

    return (
        <Box sx={{ width: '100vw', height: '100vh' }} alignItems={'center'} display="flex" justifyContent={'center'}>
            <Paper elevation={3} sx={{ p: '2rem', borderRadius: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
                <Stack display='flex' alignItems={'center'} justifyContent={'center'}>
                    <Divider />
                    <Box display='flex' alignItems={'center'} justifyContent={'center'}>
                        <Logo />
                        <Stack ml={'6rem'}>

                            <TextFieldSmaller select label="Select User" variant='filled' value={credentials.username || ''} onChange={handleChange} name="username">
                                {availableUsers.map((user) => (
                                    <MenuItemSmaller key={user.id} value={user.username}>
                                        {user.username}
                                    </MenuItemSmaller>
                                ))}
                            </TextFieldSmaller>


                            <TextFieldSmaller
                                label="Password"
                                type="password"
                                variant='filled'
                                value={credentials.password || ''}
                                onChange={handleChange}
                                name="password"
                                error={badPassword} />
                        </Stack>
                    </Box>
                    <Divider />
                    <ButtonWidest variant="contained" onClick={handleSubmit}>
                        Login
                    </ButtonWidest>

                </Stack>
            </Paper>
        </Box>
    )
}