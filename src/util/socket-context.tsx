import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useTRZ } from '@trz/util/TRZ-context';
import { ClientSE, ClientSEReplies, ClientSocketIOEvent, Position, RoomId, ServerSE, ServerSEPayload, SocketId, UserData } from '@mosaiq/terrazzo-common/socketTypes';
import { Board, TextBlock, TextBlockEvent, TextBlockId} from '@mosaiq/terrazzo-common/types';
import { NoteType, notify } from '@trz/util/notifications';
import { useIdle, useThrottledCallback } from '@mantine/hooks';
import { IDLE_TIMEOUT_MS, MOUSE_UPDATE_THROTTLE_MS } from './textUtils';
import { executeTextBlockEvent } from '@mosaiq/terrazzo-common/utils/textUtils';

type SocketContextType = {
    sid?: SocketId;
    connected: boolean;
    room: RoomId | null;
    setRoom: (room: RoomId) => void;
    roomUsers: UserData[];
    boardData: Board | undefined;
    moveMouse: (pos: Position) => void;
    setIdle: (idle: boolean) => void;
    getBoardData: (boardId: string) => Promise<boolean | undefined>;
    createBoard: (name: string, boardCode: string) => Promise<string | undefined>;
    addList: (boardID: string, listName: string) => Promise<boolean | undefined>;
    addCard: (listID: string, cardName: string) => Promise<boolean | undefined>;
    setCollaborativeText: (text: string|undefined) => void;
    collaborativeText: string | undefined;
    getTextBlockData: (textBlockId: TextBlockId) => Promise<TextBlock | undefined>;
    updateTextBlock: (event: TextBlockEvent) => void;
    updateCaret: (pos:Position | undefined, selectionStart: number | undefined) => void;
    collabCaretSelStart: number | undefined;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);


const SocketProvider: React.FC<any> = ({ children }) => {
    const trz = useTRZ();
    const idle = useIdle(IDLE_TIMEOUT_MS);
    const [socket, setSocketState] = useState<Socket | null>(null);
    const [room, setRoomState] = useState<RoomId>(null);
    const [roomUsers, setRoomUsersState] = useState<UserData[]>([]);
    const [connected, setConnected] = useState<boolean>(false);
    const [boardData, setBoardData] = useState<Board>();
    const [collaborativeText, setCollaborativeText] = useState<string | undefined>(undefined);
    const [collabCaretSelStart, setCollabCaretSelStart] = useState<number | undefined>(undefined);

    useEffect(() => {
        setIdle(idle);
    }, [idle]);

    useEffect(() => {
        if (!process.env.SOCKET_URL) {
			throw new Error("SOCKET_URL environment variable is not set");
		}
        if(!trz.githubAuthToken) {
            return;
        }

        // CREATE SOCKET CONNECTION
        const sock = io(process.env.SOCKET_URL, {
            auth: { token: trz.githubAuthToken }
        });

        setSocketState(sock);

        // ENGINE EVENTS - provided by socket.io
		sock.on(ClientSocketIOEvent.CONNECT, async () => {
            const engine = sock.io.engine;
            setConnected(false);
            engine.once("upgrade", () => {
                if (engine.transport.name === "websocket") {
                } else {
                    notify(NoteType.CONNECTION_ERROR);
                    sock.disconnect();
                }
            });
        });

        sock.on(ClientSocketIOEvent.CONNECT_ERROR, () => {
            setConnected(false);
            notify(NoteType.CONNECTION_ERROR);
        });

		sock.on(ClientSocketIOEvent.DISCONNECT, () => {
            setConnected(false);
            notify(NoteType.DISCONNECTED);
		});
        sock.io.on(ClientSocketIOEvent.RECONNECT_ATTEMPT, () => {
            notify(NoteType.RECONNECTING);
        });
          
        sock.io.on(ClientSocketIOEvent.RECONNECT, () => {
            const engine = sock.io.engine;
            setConnected(false);
            notify(NoteType.RECONNECTING_SERVER_FOUND);
            engine.once("upgrade", () => {
                if (engine.transport.name === "websocket") {
                    notify(NoteType.CONNECTION_ESTABLISHED);
                } else {
                    notify(NoteType.CONNECTION_ERROR);
                    sock.disconnect();
                }
            });
        });

        // CUSTOM EVENTS - defined by us

        sock.on(ServerSE.READY, (payload: ServerSEPayload[ServerSE.READY]) => {
            setConnected(true);
        });

        sock.on(ServerSE.CLIENT_JOINED_ROOM, (payload: ServerSEPayload[ServerSE.CLIENT_JOINED_ROOM]) => {
            setRoomUsersState(prev => prev.filter(user => {
                return user.sid !== payload.sid;
            }).concat(payload));
        });

        sock.on(ServerSE.CLIENT_LEFT_ROOM, (payload: ServerSEPayload[ServerSE.CLIENT_LEFT_ROOM]) => {
            setRoomUsersState(prev => prev.filter(user => {
                return user.sid !== payload;
            }));
        });

        sock.on(ServerSE.MOUSE_MOVE, (payload: ServerSEPayload[ServerSE.MOUSE_MOVE]) => {
            setRoomUsersState(prev => prev.map(user => {
                if(user.sid === payload.sid) {
                    return {
                        ...user,
                        mouseRoomData: payload.data
                    } as UserData;
                }
                return user;
            }));
        });

        sock.on(ServerSE.USER_IDLE, (payload: ServerSEPayload[ServerSE.USER_IDLE]) => {
            setRoomUsersState(prev => prev.map(user => {
                if(user.sid === payload.sid) {
                    return { ...user, idle: payload.idle };
                }
                return user;
            }));
        });

        sock.on(ServerSE.ADD_LIST, (payload: ServerSEPayload[ServerSE.ADD_LIST]) => {
            setBoardData(prev => {
                if(!prev) {return prev;}
                return {
                    ...prev,
                    lists: prev.lists.concat(payload)
                }
            });
        });

        sock.on(ServerSE.ADD_CARD, (payload: ServerSEPayload[ServerSE.ADD_CARD]) => {
            setBoardData(prev => {
                if(!prev) {return prev;}
                return {
                    ...prev,
                    lists: prev.lists.map(list => {
                        if(list.id === payload.listId) {
                            return {
                                ...list,
                                cards: list.cards.concat(payload)
                            }
                        }
                        return list;
                    })
                }
            });
        });

        sock.on(ServerSE.UPDATE_TEXT_BLOCK, (payload: ServerSEPayload[ServerSE.UPDATE_TEXT_BLOCK]) => {
            if (!payload) {
                return;
            }
            setCollaborativeText((prev)=>{
                let caret
                setCollabCaretSelStart((prev)=>{
                    caret = prev;
                    return caret;
                })
                const {updated, selectionStart} = executeTextBlockEvent(prev ?? '', payload, caret);
                return updated;
            });
        });

        sock.on(ServerSE.TEXT_CARET, (payload: ServerSEPayload[ServerSE.TEXT_CARET]) => {
            setRoomUsersState(prev => prev.map(user => {
                if(user.sid === payload.sid) {
                    return {
                        ...user,
                        textRoomData: {caret: payload.caret}
                    } as UserData;
                }
                return user;
            }));
        });

        
        return () => {
            setConnected(false);
            sock.disconnect();
        }
    }, [trz.githubAuthToken]);
    

    const setRoom = (room: RoomId) => {
        setRoomState(room);
        if (!socket) {return;}
        socket.emit(ClientSE.SET_ROOM, room, (response: ClientSEReplies[ClientSE.SET_ROOM], error?: string) => {
            if(error) {
                console.error("Error changing room:", error);
            } else {
                setRoomUsersState(response.users);
            }
        });
    }
    
    const moveMouse = (pos: Position) => {
        if (!socket || !room || !connected || roomUsers.length === 0) {return;}
        socket.volatile.emit(ClientSE.MOUSE_MOVE, pos, (response: ClientSEReplies[ClientSE.MOUSE_MOVE], error?: string) => {
            if(error) {
                console.error("Error moving mouse:", error);
            }
        });
    }
    const throttledMoveMouse = useThrottledCallback(moveMouse, MOUSE_UPDATE_THROTTLE_MS);

    const setIdle = (idle: boolean) => {
        if (!socket) {return;}
        socket.emit(ClientSE.USER_IDLE, idle, (response: ClientSEReplies[ClientSE.USER_IDLE], error?: string) => {
            if(error) {
                console.error("Error setting idle:", error);
            }
        });
    }

    const getBoardData = async (boardId: string): Promise<boolean | undefined> => {
        if (!socket) {return undefined;}
        return new Promise((resolve, reject) => {
            socket.emit(ClientSE.GET_BOARD, boardId, (response: ClientSEReplies[ClientSE.GET_BOARD], error?: string) => {
                if(error) {
                    reject(error);
                } else {
                    setBoardData(response.board);
                    return true;
                }
            });
        });
    }

    const createBoard = async (name: string, boardCode:string):Promise<string | undefined> => {
        if (!socket) {return undefined;}
        return new Promise((resolve, reject) => {
            socket.emit(ClientSE.CREATE_BOARD, {name, boardCode}, (response: ClientSEReplies[ClientSE.CREATE_BOARD], error?: string) => {
                if(error) {
                    reject(error);
                } else {
                    resolve(response.boardID);
                }
            });
        });
    }

    const addList = async (boardID:string, listName:string):Promise<boolean | undefined> => {
        if (!socket) {return undefined;}
        return new Promise((resolve, reject) => {
            socket.emit(ClientSE.CREATE_LIST, {boardID, listName}, (response: ClientSEReplies[ClientSE.CREATE_LIST], error?: string) => {
                if(error) {
                    reject(error);
                } else {
                    resolve(response.success);
                }
            });
        });
    }

    const addCard = async (listID:string, cardName:string):Promise<boolean | undefined> => {
        if (!socket) {return undefined;}
        return new Promise((resolve, reject) => {
            socket.emit(ClientSE.CREATE_CARD, {listID, cardName}, (response: ClientSEReplies[ClientSE.CREATE_CARD], error?: string) => {
                if(error) {
                    reject(error);
                } else {
                    resolve(response.success);
                }
            });
        });
    }

    const getTextBlockData = async (textBlockId:TextBlockId): Promise<TextBlock | undefined> => {
        if(!socket) {return undefined;}
        return new Promise((resolve, reject)=>{
            socket.emit(ClientSE.GET_TEXT_BLOCK, textBlockId, (response: ClientSEReplies[ClientSE.GET_TEXT_BLOCK], error?:string)=>{
                if(error) {
                    reject(error);
                } else{
                    resolve(response);
                }
            });
        });
    };

    const updateTextBlock = async (textBlockEvent:TextBlockEvent) => {
        if(!socket) {return undefined;}
        return new Promise((resolve, reject)=>{
            socket.emit(ClientSE.UPDATE_TEXT_BLOCK, textBlockEvent, (response: ClientSEReplies[ClientSE.UPDATE_TEXT_BLOCK], error?:string)=>{
                if (error){
                    reject(error);
                } else {
                    resolve(undefined);
                }
            });
        });
    };

    const updateCaret = (pos: Position | undefined, selectionStart: number |  undefined): void => {
        setCollabCaretSelStart(selectionStart);
        syncUpdatedCaret(pos);
    }
    const syncUpdatedCaret = useThrottledCallback((pos?: Position) => {
        if (!socket || !room || !connected || roomUsers.length === 0) {return;}
        socket.volatile.emit(ClientSE.TEXT_CARET, pos, (response: ClientSEReplies[ClientSE.TEXT_CARET], error?: string) => {
            if(error) {
                console.error("Error moving mouse:", error);
            }
        });
    }, MOUSE_UPDATE_THROTTLE_MS);



    return (
        <SocketContext.Provider value={{
            sid: socket?.id,
            connected,
            room,
            setRoom,
            roomUsers,
            boardData,
            moveMouse: throttledMoveMouse,
            setIdle,
            getBoardData,
            createBoard,
            addList,
            addCard,
            setCollaborativeText,
            collaborativeText,
            getTextBlockData,
            updateTextBlock,
            updateCaret,
            collabCaretSelStart

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