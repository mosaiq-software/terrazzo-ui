import React, {createContext, useContext, useEffect, useState} from 'react';
import {io, Socket} from 'socket.io-client';
import {useTRZ} from '@trz/util/TRZ-context';
import {
    ClientSE,
    ClientSEPayload,
    ClientSEReplies,
    ClientSocketIOEvent,
    Position,
    RoomId,
    ServerSE,
    ServerSEPayload,
    SocketId,
    UserData
} from '@mosaiq/terrazzo-common/socketTypes';
import {
    Board,
    BoardId,
    Card,
    CardHeader,
    CardId,
    List,
    ListId,
    Organization,
    OrganizationId,
    Project,
    ProjectId,
    TextBlockEvent,
    TextBlockId,
    UID, User,
    UserId
} from '@mosaiq/terrazzo-common/types';
import {NoteType, notify} from '@trz/util/notifications';
import {useIdle, useThrottledCallback} from '@mantine/hooks';
import {
    getCaretCoordinates,
    IDLE_TIMEOUT_MS,
    MOUSE_UPDATE_THROTTLE_MS,
    TEXT_EVENT_EMIT_THROTTLE_MS,
    TextObject
} from './textUtils';
import {executeTextBlockEvent} from '@mosaiq/terrazzo-common/utils/textUtils';
import {arrayMove, updateBaseFromPartial} from '@mosaiq/terrazzo-common/utils/arrayUtils';

type SocketContextType = {
    sid?: SocketId;
    connected: boolean;
    room: RoomId | null;
    setRoom: (room: RoomId) => void;
    roomUsers: UserData[];
    boardData: Board | undefined;
    moveMouse: (pos: Position) => void;
    setIdle: (idle: boolean) => void;
    getBoardData: (boardId: BoardId) => Promise<void>;
    createOrganization: (name: string, creator: UserId) => Promise<OrganizationId | undefined>
    createProject: (name: string, orgId: OrganizationId) => Promise<ProjectId | undefined>
    createBoard: (name: string, boardCode: string, projectId: ProjectId) => Promise<BoardId | undefined>;
    createList: (boardID: BoardId, listName: string) => Promise< undefined>;
    createCard: (listID: ListId, cardName: string) => Promise<undefined>;
    initializeTextBlockData: (textBlockId: TextBlockId) => Promise<void>;
    collaborativeTextObject: TextObject;
    setCollaborativeTextObject: React.Dispatch<React.SetStateAction<TextObject>>;
    receiveCollabTextEvent: (event: TextBlockEvent, element: HTMLTextAreaElement | undefined, emit: boolean) => void;
    syncCaretPosition: (element: HTMLTextAreaElement | undefined) => void;
    moveList: (listId: ListId, position: number) => Promise<void>;
    moveCard: (cardId: CardId, toList: ListId, position?: number) => Promise<void>;
    setDraggingObject: React.Dispatch<React.SetStateAction<{list?: ListId, card?: CardId}>>;
    moveListToPos: (listId: ListId, position: number) => void;
    moveCardToListAndPos: (cardId: CardId, toList: ListId, position?: number) => void;
    getMyOrganizations: (userId: UserId) => Promise<ClientSEReplies[ClientSE.GET_USERS_ENTITIES] | undefined>;
    getOrganizationData: (orgId: OrganizationId) => Promise<Organization | undefined>;
    getProjectData: (projectId: ProjectId) => Promise<Project | undefined>;
    updateOrgField: (id: OrganizationId, partial: Partial<Organization>) => Promise<void>;
    updateProjectField: (id: ProjectId, partial: Partial<Project>) => Promise<void>;
    updateBoardField: (id: BoardId, partial: Partial<Board>) => Promise<void>;
    updateListField: (id: ListId, partial: Partial<List>) => Promise<void>;
    updateCardField: (id: CardId, partial: Partial<Card>) => Promise<void>;
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
    const [boardData, setBoardData] = useState<Board | undefined>();
    const [collaborativeTextObject, setCollaborativeTextObject] = useState<TextObject>({text: '', caret: undefined, relative: undefined, queue:[]});
    const [draggingObject, setDraggingObject] = useState<{list?: ListId, card?: CardId}>({});

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
                if (engine.transport.name !== "websocket") {
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

        sock.on(ServerSE.UPDATE_BOARD_FIELD, (payload: ServerSEPayload[ServerSE.UPDATE_BOARD_FIELD]) => {
            setBoardData(prev => {
                if(!prev) {return prev;}
                return updateBaseFromPartial<Board>(prev, payload);
            });
        });

        sock.on(ServerSE.UPDATE_LIST_FIELD, (payload: ServerSEPayload[ServerSE.UPDATE_LIST_FIELD]) => {
            setBoardData(prev => {
                if(!prev) {return prev;}
                return {
                    ...prev,
                    lists: prev.lists.map(list => {
                        if(list.id === payload.id) {
                            return updateBaseFromPartial<List>(list, payload)
                        }
                        return list;
                    })
                }
            });
        });

        sock.on(ServerSE.UPDATE_CARD_FIELD, (payload: ServerSEPayload[ServerSE.UPDATE_CARD_FIELD]) => {
            setBoardData(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    lists: prev.lists.map(list => ({
                        ...list,
                        cards: list.cards
                            .map(card => {
                                if (card.id === payload.id) {
                                    return updateBaseFromPartial<CardHeader>(card, payload);
                                }
                                return card;
                            }).filter((card: CardHeader) => !card.archived) // Remove null values (filtered out cards)
                    }))
                };
            });
        });

        sock.on(ServerSE.UPDATE_TEXT_BLOCK, (payload: ServerSEPayload[ServerSE.UPDATE_TEXT_BLOCK]) => {
            if (!payload) {
                return;
            }
            for (const event of payload.events){
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

    /**
        Emit events to the backend
        @returns The servers response
        @throws Server error
    */
    function emit<T extends ClientSE>(event: T, payload: ClientSEPayload[T]): Promise<ClientSEReplies[T] | undefined> {
        return new Promise((resolve: (response: ClientSEReplies[T])=>void, reject: (error?: string)=>void) => {
            if(!socket){
                return undefined;
            }
            socket.emit(event, payload, (response: ClientSEReplies[T], error?: string) => {
                if(error) {
                    reject(error);
                } else {
                    resolve(response);
                }
            });
        });
    }

    /**
     * Emit a volatile event. These will not queue and are not guaranteed delivery at all.
     * @returns The servers reply
     * @throws Any server error
     */
    function volatileEmit<T extends ClientSE>(event: ClientSE, payload: ClientSEPayload[T]): Promise<ClientSEReplies[T] | undefined> {
        return new Promise((resolve: (response: ClientSEReplies[T])=>void, reject: (error?: string)=>void) => {
            if (!socket || !room || !connected || roomUsers.length === 0) {
                return undefined;
            }
            socket.volatile.emit(event, payload, (response: ClientSEReplies[T], error?: string) => {
                if(error) {
                    reject(error);
                } else {
                    resolve(response);
                }
            });
        });
    }



    // EVENT EMITTERS

    const setRoom = async (room: RoomId) => {
        setRoomState(room);
        const response = await emit<ClientSE.SET_ROOM>(ClientSE.SET_ROOM, room);
        if(response) {
            setRoomUsersState(response.users);
        }
    }

    const moveMouse = useThrottledCallback((pos: Position) => {
        if (!socket || !room || !connected || roomUsers.length === 0) {return;}
        volatileEmit<ClientSE.MOUSE_MOVE>(ClientSE.MOUSE_MOVE, {pos, draggingList: draggingObject.list, draggingCard: draggingObject.card});
    }, MOUSE_UPDATE_THROTTLE_MS);

    const setIdle = (idle: boolean) => {
        emit<ClientSE.USER_IDLE>(ClientSE.USER_IDLE, idle);
    }

    const getMyOrganizations = async (userId: UserId): Promise<ClientSEReplies[ClientSE.GET_USERS_ENTITIES] | undefined> => {
        try {
            const response = await emit<ClientSE.GET_USERS_ENTITIES>(ClientSE.GET_USERS_ENTITIES, userId);
            if(!response) throw new Error("No data found for user "+userId);
            return response;
        } catch (e:any){
            notify(NoteType.BOARD_DATA_ERROR, e);
            return undefined;
        }
    }

    const getOrganizationData = async (orgId: OrganizationId): Promise<Organization | undefined> => {
        try {
            const org = await emit<ClientSE.GET_ORGANIZATION>(ClientSE.GET_ORGANIZATION, orgId);
            if(!org) throw new Error("No data found for organization "+orgId);
            return org;
        } catch (e:any){
            notify(NoteType.ORG_DATA_ERROR, e);
            return undefined;
        }
    }

    const getProjectData = async (projectId: ProjectId): Promise<Project | undefined> => {
        try {
            const project = await emit<ClientSE.GET_PROJECT>(ClientSE.GET_PROJECT, projectId);
            if(!project) throw new Error("No data found for project "+projectId);
            return project;
        } catch (e:any){
            notify(NoteType.PROJECT_DATA_ERROR, e);
            return undefined;
        }
    }

    const getBoardData = async (boardId: BoardId): Promise<void> => {
        try {
            const response = await emit<ClientSE.GET_BOARD>(ClientSE.GET_BOARD, boardId);
            setBoardData(response);
        } catch (e:any){
            notify(NoteType.BOARD_DATA_ERROR, e);
        }
    }

    const createOrganization = async (name: string, creator:UserId):Promise<OrganizationId | undefined> => {
        return await emit<ClientSE.CREATE_ORG>(ClientSE.CREATE_ORG, {name, creator});
    }

    const createProject = async (name: string, orgId: OrganizationId):Promise<ProjectId | undefined> => {
        return await emit<ClientSE.CREATE_PROJECT>(ClientSE.CREATE_PROJECT, {name, orgId});
    }

    const createBoard = async (name: string, boardCode:string, projectId: ProjectId):Promise<BoardId | undefined> => {
        return await emit<ClientSE.CREATE_BOARD>(ClientSE.CREATE_BOARD, {name, boardCode, projectId});
    }

    const createList = async (boardID:BoardId, listName:string):Promise<undefined> => {
        await emit<ClientSE.CREATE_LIST>(ClientSE.CREATE_LIST, {boardID, listName});
    }

    const createCard = async (listID:ListId, cardName:string):Promise<undefined> => {
        await emit<ClientSE.CREATE_CARD>(ClientSE.CREATE_CARD, {listID, cardName});
    }

    async function updateField<T extends (Card | List | Board | Project | Organization)>(
        event:
            ClientSE.UPDATE_ORG_FIELD |
            ClientSE.UPDATE_PROJECT_FIELD |
            ClientSE.UPDATE_BOARD_FIELD |
            ClientSE.UPDATE_LIST_FIELD |
            ClientSE.UPDATE_CARD_FIELD,
        id: UID,
        partial: Partial<T>
    ): Promise<void> {
        try {
            await emit<typeof event>(event, {...partial, id});
        } catch (e:any) {
            notify({
                [ClientSE.UPDATE_ORG_FIELD]: NoteType.ORG_DATA_ERROR,
                [ClientSE.UPDATE_PROJECT_FIELD]: NoteType.PROJECT_DATA_ERROR,
                [ClientSE.UPDATE_BOARD_FIELD]: NoteType.BOARD_DATA_ERROR,
                [ClientSE.UPDATE_LIST_FIELD]: NoteType.LIST_UPDATE_ERROR,
                [ClientSE.UPDATE_CARD_FIELD]: NoteType.CARD_UPDATE_ERROR,
            }[event], e);
        }
    }

    const updateOrgField = async (id: OrganizationId, partial: Partial<Organization>) => updateField<Organization>(ClientSE.UPDATE_ORG_FIELD, id, partial);
    const updateProjectField = async (id: ProjectId, partial: Partial<Project>) => updateField<Project>(ClientSE.UPDATE_PROJECT_FIELD, id, partial);
    const updateBoardField = async (id: BoardId, partial: Partial<Board>) => updateField<Board>(ClientSE.UPDATE_BOARD_FIELD, id, partial);
    const updateListField = async (id: ListId, partial: Partial<List>) => updateField<List>(ClientSE.UPDATE_LIST_FIELD, id, partial);
    const updateCardField = async (id: CardId, partial: Partial<Card>) => updateField<Card>(ClientSE.UPDATE_CARD_FIELD, id, partial);

    const initializeTextBlockData = async (textBlockId:TextBlockId): Promise<void> => {
        try {
            const text = await emit<ClientSE.GET_TEXT_BLOCK>(ClientSE.GET_TEXT_BLOCK, textBlockId);
            setCollaborativeTextObject({ text: text?.text ?? '', caret: undefined, relative: undefined, queue: [] });
        } catch (e:any) {
            notify(NoteType.TEXT_BLOCK_INIT_ERROR, e);
        }
    };

    const emitTextBlockEvents = async (textBlockEvents:TextBlockEvent[]): Promise<string | undefined> => {
        try{
            const res = await emit<ClientSE.UPDATE_TEXT_BLOCK>(ClientSE.UPDATE_TEXT_BLOCK, textBlockEvents);
            return res;
        } catch (e) {
            notify(NoteType.TEXT_EVENT_WARN, e)
        }
    };

    const syncUpdatedCaret = useThrottledCallback((pos?: Position) => {
        volatileEmit<ClientSE.TEXT_CARET>(ClientSE.TEXT_CARET, pos);
    }, MOUSE_UPDATE_THROTTLE_MS);

    const moveList = async (listId: ListId, position: number): Promise<void> => {
        moveListToPos(listId, position);
        await emit<ClientSE.MOVE_LIST>(ClientSE.MOVE_LIST, {listId, position});
    }

    const moveCard = async (cardId: CardId, toList: ListId, position?: number): Promise<void> => {
        moveCardToListAndPos(cardId, toList, position);
        await emit<ClientSE.MOVE_CARD>(ClientSE.MOVE_CARD, {cardId, toList, position});
    }




    // HELPERS

    const moveListToPos = (listId: ListId, position: number) => setBoardData((prevBoard)=>{
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

    const moveCardToListAndPos = (cardId: CardId, toList: ListId, position?: number) => setBoardData((prevBoard)=>{
        if(!prevBoard)return prevBoard;
        let currentListIndex: number = -1;
        let currentCardIndexInCurrentList = -1;
        let card: CardHeader | null = null;
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

    const getUserViaGithub = async (userId: string): Promise<User | undefined> => {
        return await emit<ClientSE.GET_USER>(ClientSE.GET_USER, userId);
    }

    const setupUser = async (id: string, username: string, firstName: string, lastName:string): Promise<User | undefined> => {
        return await emit<ClientSE.SETUP_USER>(ClientSE.SETUP_USER, {id, username, firstName, lastName});
    }

    const checkUserNameTaken = async (username: string): Promise<boolean | undefined> => {
        return await emit<ClientSE.CHECK_USERNAME_TAKEN>(ClientSE.CHECK_USERNAME_TAKEN, username);
    }

    return (
        <SocketContext.Provider value={{
            sid: socket?.id,
            connected,
            room,
            setRoom,
            roomUsers,
            boardData,
            moveMouse,
            setIdle,
            getMyOrganizations,
            getOrganizationData,
            getProjectData,
            getBoardData,
            createOrganization,
            createProject,
            createBoard,
            createList,
            createCard,
            initializeTextBlockData,
            collaborativeTextObject,
            setCollaborativeTextObject,
            receiveCollabTextEvent,
            syncCaretPosition,
            moveList,
            moveCard,
            setDraggingObject,
            moveListToPos,
            moveCardToListAndPos,
            updateOrgField,
            updateProjectField,
            updateBoardField,
            updateListField,
            updateCardField,
            getUserViaGithub,
            setupUser,
            checkUserNameTaken,
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