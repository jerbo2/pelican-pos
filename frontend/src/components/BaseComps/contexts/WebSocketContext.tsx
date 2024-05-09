import React, { createContext, useEffect, useState } from 'react';

const WebSocketContext = createContext<{
    sendMessage: (message: string) => void,
    lastMessage: string | null,
    isConnected: boolean,
}>({
    sendMessage: () => { },
    lastMessage: null,
    isConnected: false,
});


type WebSocketProviderProps = {
    children: React.ReactNode;
    url: string;
};

const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children, url }) => {
    const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
    const [lastMessage, setLastMessage] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);

    useEffect(() => {
        const ws = new WebSocket(url);

        ws.onopen = () => {
            console.log('WebSocket Connected');
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            //console.log('Received message: ', event.data);
            setLastMessage(event.data);
        };

        ws.onclose = () => {
            console.log('WebSocket Disconnected');
            setIsConnected(false);
        };

        ws.onerror = (event) => {
            console.error('WebSocket Error: ', event);
        };

        setWebSocket(ws);

        return () => {
            ws.close();
        };
    }, [url]);

    const sendMessage = (message: string) => {
        if (webSocket && isConnected) {
            webSocket.send(message);
        } else {
            console.error('WebSocket is not connected.');
        }
    };

    return (
        <WebSocketContext.Provider value={{ sendMessage, lastMessage, isConnected }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export { WebSocketProvider, WebSocketContext };
