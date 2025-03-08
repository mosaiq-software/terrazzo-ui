import React, {createContext, useContext, useEffect, useState} from 'react';
import {io, Socket} from 'socket.io-client';
import {
    ClientSE,
    ClientSEPayload,
    ClientSEReplies,
    ClientSocketIOEvent,
    Position,
    ServerSE,
    ServerSEPayload,
    SocketHandshakeAuth,
    SocketId,
    UserData
} from '@mosaiq/terrazzo-common/socketTypes';
import {
    Card,
    CardHeader,
    CardId,
    List,
    ListId,
    TextBlockEvent,
    TextBlockId,
    UserHeader, UserId
} from '@mosaiq/terrazzo-common/types';
import {NoteType, notify} from '@trz/util/notifications';
import { useThrottledCallback} from '@mantine/hooks';
import {
    getCaretCoordinates,
    MOUSE_UPDATE_THROTTLE_MS,
    TEXT_EVENT_EMIT_THROTTLE_MS,
} from '@trz/util/textUtils';
import {executeTextBlockEvent, fullName} from '@mosaiq/terrazzo-common/utils/textUtils';
import {arrayMove, updateBaseFromPartial} from '@mosaiq/terrazzo-common/utils/arrayUtils';
import { useUser } from './user-context';

export type SocketContextType = {
    socket: Socket | null;
    sid: SocketId | undefined;
    connected: boolean;
    emit<T extends ClientSE>(event: T, payload: ClientSEPayload[T]): Promise<ClientSEReplies[T] | undefined>;
    volatileEmit: <T extends ClientSE>(event: ClientSE, payload: ClientSEPayload[T]) => Promise<ClientSEReplies[T] | undefined>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SocketProvider: React.FC<any> = ({ children }) => {
    const usr = useUser();
    const [socket, setSocketState] = useState<Socket | null>(null);
    const [connected, setConnected] = useState<boolean>(false);
    // const [collaborativeTextObject, setCollaborativeTextObject] = useState<TextObject>({text: '', caret: undefined, relative: undefined, queue:[]});
    // const [userLookup, setUserLookup] = useState<{[userId:UserId]:UserHeader}>({});

    useEffect(() => {
        if (!process.env.SOCKET_URL) {
			throw new Error("SOCKET_URL environment variable is not set");
		}
        if(!usr.userData?.id || !usr.githubAuthToken) {
            return;
        }

        // CREATE SOCKET CONNECTION
        const auth:SocketHandshakeAuth = {
            userId: usr.userData.id,
            githubToken: usr.githubAuthToken,
        };
        const sock = io(process.env.SOCKET_URL, {auth});

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

        sock.on(ServerSE.READY, async (payload: ServerSEPayload[ServerSE.READY]) => {
            setConnected(true);
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
                                    return updateBaseFromPartial<Card>(card, payload);
                                }
                                return card;
                            }).filter((card) => !card.archived) // Remove null values (filtered out cards)
                    }))
                };
            });
        });

        sock.on(ServerSE.UPDATE_CARD_ASSIGNEE, (payload: ServerSEPayload[ServerSE.UPDATE_CARD_ASSIGNEE]) => {
            setBoardData(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    lists: prev.lists.map(list => ({
                        ...list,
                        cards: list.cards
                            .map(card => {
                                if (card.id === payload.cardId) {
                                    const members = card.assignees.filter(u=>u!==payload.userId);
                                    if(payload.assigned){
                                        members.push(payload.userId);
                                    }
                                    return {
                                        ...card,
                                        assignees: members, 
                                    }
                                }
                                return card;
                            })
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

        sock.on(ServerSE.RECEIVE_INVITE, (payload: ServerSEPayload[ServerSE.RECEIVE_INVITE]) => {
            notify(NoteType.INVITE_RECEIVED, [fullName(payload.fromUser), payload.entity.name],{
                primary: async ()=>{
                    try {
                        acceptInvitation(payload);
                    } catch (e) {
                        notify(NoteType.GENERIC_ERROR, e);
                    }
                },
                secondary: ()=>{
                    try {
                        replyInvite(payload.id, false);
                    } catch (e) {
                        notify(NoteType.GENERIC_ERROR, e);
                    }
                }
            });
            syncUserDash();
        });
        

        return () => {
            setConnected(false);
            sock.disconnect();
        }
    }, [usr.userData?.id, usr.githubAuthToken]);

    /**
        Emit events to the backend
        @returns The servers response
        @throws Server error
    */
    function emit<T extends ClientSE>(event: T, payload: ClientSEPayload[T]): Promise<ClientSEReplies[T] | undefined> {
        return new Promise((resolve: (response: ClientSEReplies[T])=>void, reject: (error?: string)=>void) => {
            if(!socket || !connected){
                return null;
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
            if (!socket || !connected) {
                return null;
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

    



    // HELPERS
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




    const lookupUser = async (userId:UserId):Promise<UserHeader | undefined> => {
        const cached = userLookup[userId];
        if(cached){
            return cached;
        }
        const fetched = await getUserHeader(userId);
        return fetched;
    }

    return (
        <SocketContext.Provider value={{
            socket,
            sid: socket?.id,
            connected,
            emit,
            volatileEmit
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