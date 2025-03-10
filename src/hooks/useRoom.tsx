import { useEffect, useState } from "react";
import {ClientSE, RoomType, ServerSE, UserData} from "@mosaiq/terrazzo-common/socketTypes"
import {useSocketListener} from "@trz/hooks/useSocketListener";
import { useSocket } from "@trz/contexts/socket-context";
import { NoteType, notify } from "@trz/util/notifications";
import { UID } from "@mosaiq/terrazzo-common/types";
import { getRoomCode } from "@mosaiq/terrazzo-common/utils/socketUtils";

export function useRoom(roomType:RoomType, roomId: UID | null | undefined): [UserData[], React.Dispatch<React.SetStateAction<UserData[]>>] {
    const [roomUsers, setRoomUsers] = useState<UserData[]>([]);
    const sockCtx = useSocket();

    useEffect(()=>{
        if(!sockCtx.connected){
            return;
        }
        if(roomId){
            sockCtx.emit<ClientSE.JOIN_ROOM>(ClientSE.JOIN_ROOM, getRoomCode(roomType, roomId)).then(res=>{
                if(res) {
                    setRoomUsers(res);
                }
            }).catch((e)=>{
                notify(NoteType.SOCKET_ROOM_ERROR, [roomId, e]);
            })
        }

        return ()=>{
            if(roomId){
                sockCtx.emit<ClientSE.LEAVE_ROOM>(ClientSE.LEAVE_ROOM, getRoomCode(roomType, roomId)).then(res=>{
                    if(res) {
                        setRoomUsers(res);
                    }
                }).catch((e)=>{
                    notify(NoteType.SOCKET_ROOM_ERROR, [roomId, e]);
                })
            }
            
        }
    }, [roomId, sockCtx.connected, sockCtx.sid])

    useSocketListener<ServerSE.CLIENT_JOINED_ROOM>(ServerSE.CLIENT_JOINED_ROOM, (payload) => {
        setRoomUsers(prev => prev.filter(user => {
            return user.sid !== payload.sid;
        }).concat(payload));
    })

    useSocketListener<ServerSE.CLIENT_LEFT_ROOM>(ServerSE.CLIENT_LEFT_ROOM, (payload) => {
        setRoomUsers(prev => prev.filter(user => {
            return user.sid !== payload;
        }));
    })

    return [roomUsers, setRoomUsers];
}