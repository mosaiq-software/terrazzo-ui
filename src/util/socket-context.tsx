import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useTRZ } from './TRZ-context';
import { notifications } from '@mantine/notifications';
import { ClientSocketIOEvent, SocketEventPayload, SocketEventTypes, UserData } from '@mosaiq/terrazzo-common/socketTypes';

type SocketContextType = {
    sid: string;
    room: string | null;
    setRoom: (room: string | null) => void;
    roomUsers: UserData[];
    moveMouse: (x: number, y: number) => void;
    setIdle: (idle: boolean) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);


const SocketProvider: React.FC<any> = ({ children }) => {
    const trz = useTRZ();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [room, setRoom] = useState<string | null>(null);
    const [roomUsers, setRoomUsers] = useState<UserData[]>([]);


    useEffect(() => {
        if (!process.env.SOCKET_URL) {
			throw new Error("SOCKET_URL environment variable is not set");
		}
        if(!trz.githubAuthToken) {
            return;
        }

        // CREATE SOCKET CONNECTION
        const sock = io(process.env.SOCKET_URL, {
            auth: { token: trz.githubAuthToken, room: room || window.location.pathname }
        });
        setSocket(sock);

        // ENGINE EVENTS - provided by socket.io
		sock.on(ClientSocketIOEvent.CONNECT, () => {
		});

		sock.on(ClientSocketIOEvent.DISCONNECT, () => {
            notifications.show({
                title: 'Disconnected',
                message: 'You have been disconnected from the server',
                color: 'red',
                autoClose: 5000,
            })
		});
        sock.io.on(ClientSocketIOEvent.RECONNECT_ATTEMPT, () => {
            notifications.show({
                title: 'Reconnecting',
                message: 'Attempting to reconnect to the server',
                color: 'blue',
                autoClose: 5000,
            })
        });
          
        sock.io.on(ClientSocketIOEvent.RECONNECT, () => {
            notifications.show({
                title: 'Reconnected',
                message: 'You have been reconnected to the server',
                color: 'green',
                autoClose: 5000,
            })
        });

        // CUSTOM EVENTS - defined by us
        sock.on(SocketEventTypes.INITIALIZE, (payload: SocketEventPayload[SocketEventTypes.INITIALIZE]) => {
            setRoomUsers(payload.roomUsers);
        });

        sock.on(SocketEventTypes.CLIENT_CONNECT, (payload: SocketEventPayload[SocketEventTypes.CLIENT_CONNECT]) => {
            setRoomUsers(prev => prev.filter(user => {
                return user.sid !== payload.sid;
            }).concat(payload));
        });

        sock.on(SocketEventTypes.CLIENT_DISCONNECT, (payload: SocketEventPayload[SocketEventTypes.CLIENT_DISCONNECT]) => {
            setRoomUsers(prev => prev.filter(user => {
                return user.sid !== payload.sid;
            }));
        });

        sock.on(SocketEventTypes.MOUSE_MOVE, (payload: SocketEventPayload[SocketEventTypes.MOUSE_MOVE]) => {
            setRoomUsers(prev => prev.map(user => {
                if(user.sid === payload.sid) {
                    return { ...user, mouse: { x: payload.x, y: payload.y } };
                }
                return user;
            }));
        });

        sock.on(SocketEventTypes.USER_IDLE, (payload: SocketEventPayload[SocketEventTypes.USER_IDLE]) => {
            setRoomUsers(prev => prev.map(user => {
                if(user.sid === payload.sid) {
                    return { ...user, idle: payload.idle };
                }
                return user;
            }));
        });

        
        return () => {
            sock.disconnect();
        }
    }, [trz.githubAuthToken]);


    useEffect(() => {
        if (socket && room) {
            socket.emit(SocketEventTypes.CHANGE_ROOM, room, (response: {error: boolean, roomUsers: UserData[]}) => {
                if(response.error) {
                    console.error("Error changing room:", response);
                } else {
                    setRoomUsers(response.roomUsers);
                }
            });
        }
    }, [room, socket]);

    const moveMouse = (x: number, y: number) => {
        if (socket) {
            socket.emit(SocketEventTypes.MOUSE_MOVE, { x, y });
        }
    }

    const setIdle = (idle: boolean) => {
        if (socket) {
            socket.emit(SocketEventTypes.USER_IDLE, { idle });
        }
    }


    return (
        <SocketContext.Provider value={{
            sid: socket?.id || "",
            room,
            setRoom,
            roomUsers,
            moveMouse,
            setIdle,
        }}>
            {children}
        </SocketContext.Provider>
    )
};

const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
}

export { SocketProvider, useSocket };