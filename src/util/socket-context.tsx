import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useTRZ } from '@trz/util/TRZ-context';
import { ClientSE, ClientSEPayload, ClientSEReplies, ClientSocketIOEvent, Position, RoomId, ServerSE, ServerSEPayload, SocketId, UserData } from '@mosaiq/terrazzo-common/socketTypes';
import { Board, Card, List, TextBlock, TextBlockEvent, TextBlockId} from '@mosaiq/terrazzo-common/types';
import { NoteType, notify } from '@trz/util/notifications';
import { useIdle, useThrottledCallback } from '@mantine/hooks';
import { getCaretCoordinates, IDLE_TIMEOUT_MS, MOUSE_UPDATE_THROTTLE_MS, TEXT_EVENT_EMIT_THROTTLE_MS, TextObject } from './textUtils';
import { executeTextBlockEvent } from '@mosaiq/terrazzo-common/utils/textUtils';
import { arrayMove } from '@mosaiq/terrazzo-common/utils/arrayUtils';
import {User} from "../../../terrazzo-common/dist/types";

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
    updateListTitle: (listID: string, newName: string) => Promise<boolean | undefined>;
    initializeTextBlockData: (textBlockId: TextBlockId) => Promise<void>;
    collaborativeTextObject: TextObject;
    setCollaborativeTextObject: React.Dispatch<React.SetStateAction<TextObject>>;
    receiveCollabTextEvent: (event: TextBlockEvent, element: HTMLTextAreaElement | undefined, emit: boolean) => void;
    syncCaretPosition: (element: HTMLTextAreaElement | undefined) => void;
    moveList: (listId: string, position: number) => Promise<void>;
    moveCard: (cardId: string, toList: string, position?: number) => Promise<void>;
    setDraggingObject: React.Dispatch<React.SetStateAction<{list?: string;card?: string;}>>;
    moveListToPos: (listId: string, position: number) => void;
    moveCardToListAndPos: (cardId: string, toList: string, position?: number) => void;
    getUserViaGithub: (userId: string) => Promise<User | undefined>;
    setupUser: (id:string, username: string, firstName: string, lastName: string) => Promise<User | undefined>;
    checkUserNameTaken: (username: string) => Promise<boolean | undefined>;
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
    const [collaborativeTextObject, setCollaborativeTextObject] = useState<TextObject>({text: '', caret: undefined, relative: undefined, queue:[]});
    const [draggingObject, setDraggingObject] = useState<{list?: string, card?: string}>({});

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

        sock.on(ServerSE.UPDATE_LIST_TITLE, (payload: ServerSEPayload[ServerSE.UPDATE_LIST_TITLE]) => {
            setBoardData(prev => {
                if(!prev) {return prev;}
                return {
                    ...prev,
                    lists: prev.lists.map(list => {
                        if(list.id === payload.listID) {
                            return {
                                ...list,
                                name: payload.title
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
            for (let event of payload.events){
                receiveCollabTextEvent(event, undefined, false);
            }
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

        sock.on(ServerSE.MOVE_LIST, (payload: ServerSEPayload[ServerSE.MOVE_LIST]) => {
            moveListToPos(payload.listId, payload.position)
            setRoomUsersState((prev)=>{
                return prev.map((ru)=>{
                    if(ru.mouseRoomData?.draggingList === payload.listId){
                        return {
                            ...ru,
                            mouseRoomData: {
                                ...ru.mouseRoomData,
                                draggingList: undefined,
                            }
                        }
                    }else{
                        return ru;
                    }
                })
            })
        });

        sock.on(ServerSE.MOVE_CARD, (payload: ServerSEPayload[ServerSE.MOVE_CARD]) => {
            moveCardToListAndPos(payload.cardId, payload.toList, payload.position);
            setRoomUsersState((prev)=>{
                return prev.map((ru)=>{
                    if(ru.mouseRoomData?.draggingCard === payload.cardId){
                        return {
                            ...ru,
                            mouseRoomData: {
                                ...ru.mouseRoomData,
                                draggingList: undefined,
                            }
                        }
                    }else{
                        return ru;
                    }
                })
            })
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
        const payload: ClientSEPayload[ClientSE.MOUSE_MOVE] = {pos, draggingList: draggingObject.list, draggingCard: draggingObject.card};
        socket.volatile.emit(ClientSE.MOUSE_MOVE, payload, (response: ClientSEReplies[ClientSE.MOUSE_MOVE], error?: string) => {
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

    const updateListTitle = async (listID:string, title:string):Promise<boolean | undefined> => {
        if (!socket) {return undefined;}
        return new Promise((resolve, reject) => {
            socket.emit(ClientSE.UPDATE_LIST_TITLE, {listID, title}, (response: ClientSEReplies[ClientSE.UPDATE_LIST_TITLE], error?: string) => {
                if(error) {
                    reject(error);
                } else {
                    resolve(response.success);
                }
            });
        });
    }

    const initializeTextBlockData = async (textBlockId:TextBlockId): Promise<void> => {
        if(!socket) {return undefined;}
        const text: TextBlock | undefined = await new Promise((resolve, reject)=>{
            socket.emit(ClientSE.GET_TEXT_BLOCK, textBlockId, (response: ClientSEReplies[ClientSE.GET_TEXT_BLOCK], error?:string)=>{
                if(error) {
                    reject(error);
                } else{
                    resolve(response);
                }
            });
        });
        setCollaborativeTextObject({
            text: text?.text ?? '',
            caret: undefined,
            relative: undefined,
            queue: [],
        });
    };

    const receiveCollabTextEvent = (event: TextBlockEvent, element: HTMLTextAreaElement | undefined, emit: boolean) => {
        setCollaborativeTextObject((prev)=>{
            const {updated, selectionStart} = executeTextBlockEvent(prev.text, event, prev.caret);
            const a = {
                text: updated,
                caret: selectionStart,
                relative: prev.relative,
                queue: [...(prev.queue), event],
            };
            const tick = async ()=>{
                await new Promise((resolve)=>setTimeout(resolve, 0));
                throttledEmitTextEvents();
            }
            if(emit){
                tick();
            }
            return a;
        });
        updateCaretPosition(element, true);
    }

    const syncCaretPosition = (element: HTMLTextAreaElement | undefined) => {
        updateCaretPosition(element);
    }

    const updateCaretPosition = async (element: HTMLTextAreaElement | undefined, useKnownPosition?: boolean): Promise<void> => {
        await new Promise((resolve)=>setTimeout(resolve, 0));
        if(!element){ 
            return;
        }
        setCollaborativeTextObject((prev)=>{
            if(prev.caret !== undefined && useKnownPosition) {
                element.selectionStart = prev.caret;
                element.selectionEnd = prev.caret;
            }
            const width = element.getBoundingClientRect().width;
            const height = element.getBoundingClientRect().height;
            const coordinates = getCaretCoordinates(element, element.selectionStart);
            const relativeCoords = {x: coordinates.left/width, y: coordinates.top/height}
    
            const a = {
                ...prev,
                caret: element.selectionStart,
                relative: relativeCoords,
            };
            syncUpdatedCaret(relativeCoords);
            return a;
        });
    }

    const throttledEmitTextEvents = useThrottledCallback(()=>{
        emitTextBlockEvents(collaborativeTextObject.queue);
        setCollaborativeTextObject((prev) => {
            return {
                ...prev,
                queue: []
            }
        });
    }, TEXT_EVENT_EMIT_THROTTLE_MS);

    const emitTextBlockEvents = async (textBlockEvents:TextBlockEvent[]): Promise<string | undefined> => {
        if(!socket) {return undefined;}
        return new Promise((resolve, reject)=>{
            socket.emit(ClientSE.UPDATE_TEXT_BLOCK, textBlockEvents, (response: ClientSEReplies[ClientSE.UPDATE_TEXT_BLOCK], error?:string)=>{
                if (error){
                    reject(error);
                } else {
                    resolve(response);
                }
            });
        });
    };

    const syncUpdatedCaret = useThrottledCallback((pos?: Position) => {
        if (!socket || !room || !connected || roomUsers.length === 0) {return;}
        socket.volatile.emit(ClientSE.TEXT_CARET, pos, (response: ClientSEReplies[ClientSE.TEXT_CARET], error?: string) => {
            if(error) {
                console.error("Error moving caret:", error);
            }
        });
    }, MOUSE_UPDATE_THROTTLE_MS);

    const moveList = async (listId: string, position: number): Promise<void> => {
        moveListToPos(listId, position);
        if(!socket) return;
        const payload: ClientSEPayload[ClientSE.MOVE_LIST] = {listId, position};
        socket.emit(ClientSE.MOVE_LIST, payload, (response: ClientSEReplies[ClientSE.MOVE_LIST], error?: string) => {
            if (error) {
                console.error("Error moving list ", listId, "to", position);
            }
        });
    }

    const moveListToPos = (listId: string, position: number) => setBoardData((prevBoard)=>{
        if(!prevBoard)return prevBoard;
        const index = prevBoard.lists.findIndex((l)=>l.id === listId);
        if(index < 0) {
            console.error("Error moving list, list not found in prev lists");
            return prevBoard;
        }
        return{
            ...prevBoard,
            lists: arrayMove<List>(prevBoard.lists, index, position)
        }
    });

    const moveCard = async (cardId: string, toList: string, position?: number): Promise<void> => {
        moveCardToListAndPos(cardId, toList, position);
        if(!socket) return;
        const payload: ClientSEPayload[ClientSE.MOVE_CARD] = {cardId, toList, position};
        socket.emit(ClientSE.MOVE_CARD, payload, (response: ClientSEReplies[ClientSE.MOVE_CARD], error?: string) => {
            if (error) {
                console.error("Error moving card", cardId, "to", toList, "at", position);
            }
        });
    }

    const moveCardToListAndPos = (cardId: string, toList: string, position?: number) => setBoardData((prevBoard)=>{
        if(!prevBoard)return prevBoard;
        let currentListIndex: number = -1;
        let currentCardIndexInCurrentList = -1;
        let card: Card | null = null;
        let newListIndex: number = -1;
        prevBoard.lists.forEach((l, li)=>{
            if(l.id === toList)
                newListIndex = li;
            l.cards.forEach((c, ci)=>{
                if(c.id === cardId){
                    card = c;
                    currentListIndex = li;
                    currentCardIndexInCurrentList = ci;
                }
            })
        })
        if(currentListIndex < 0 || newListIndex < 0 || currentCardIndexInCurrentList < 0 || card === null){
            console.error("Error moving card to list, list or card not found");
            return prevBoard;
        }
        prevBoard.lists[currentListIndex].cards.splice(currentCardIndexInCurrentList, 1);
        prevBoard.lists[newListIndex].cards.splice(position ?? prevBoard.lists[newListIndex].cards.length, 0, card);
        return {...prevBoard};
    });

    const getUserViaGithub = async (userId: string): Promise<User | undefined> => {
        if (!socket) {return undefined;}
        return new Promise((resolve, reject) => {
            socket.emit(ClientSE.GET_USER, userId, (response: ClientSEReplies[ClientSE.GET_USER], error?: string) => {
                if(error) {
                    reject(error);
                } else {
                    resolve(response.user);
                }
            });
        });
    }

    const setupUser = async (id: string, username: string, firstName: string, lastName:string): Promise<User | undefined> => {
        if (!socket) {return undefined;}
        return new Promise((resolve, reject) => {
            socket.emit(ClientSE.SETUP_USER, {id, username, firstName, lastName}, (response: ClientSEReplies[ClientSE.SETUP_USER], error?: string) => {
                if(error) {
                    reject(error);
                } else {
                    resolve(response.user);
                }
            });
        });
    }

    const checkUserNameTaken = async (username: string): Promise<boolean | undefined> => {
        if (!socket) {return undefined;}
        return new Promise((resolve, reject) => {
            socket.emit(ClientSE.CHECK_USERNAME_TAKEN, username, (response: ClientSEReplies[ClientSE.CHECK_USERNAME_TAKEN], error?: string) => {
                if(error) {
                    console.error("Error checking username:", error);
                    reject(error);
                } else {
                    console.log("Username taken", response.taken);
                    resolve(response.taken);
                }
            });
        });
    }


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
            updateListTitle,
            initializeTextBlockData,
            collaborativeTextObject,
            setCollaborativeTextObject,
            receiveCollabTextEvent,
            syncCaretPosition,
            moveList,
            moveCard,
            setDraggingObject,
            moveListToPos,
            moveCardToListAndPos
            syncCaretPosition,
            getUserViaGithub,
            setupUser,
            checkUserNameTaken
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