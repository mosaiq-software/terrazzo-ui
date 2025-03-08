import React, { MouseEventHandler, useEffect, useRef, useState } from 'react';
import { useSocket } from "@trz/contexts/socket-context";
import UserCursor from "@trz/components/UserCursor";
import { getRoomCode } from '@mosaiq/terrazzo-common/utils/socketUtils';
import { ClientSE, Position, RoomType, ServerSE, ServerSEPayload, UserData } from '@mosaiq/terrazzo-common/socketTypes';
import { Box, MantineStyleProp } from '@mantine/core';
import { BoardId, CardId, ListId } from '@mosaiq/terrazzo-common/types';
import { NoteType, notify } from '@trz/util/notifications';
import { useIdle, useThrottledCallback } from '@mantine/hooks';
import { IDLE_TIMEOUT_MS, MOUSE_UPDATE_THROTTLE_MS } from '@trz/util/textUtils';
import {useSocketListener} from "@trz/hooks/useSocketListener";
import {useRoom} from "@trz/hooks/useRoom";

interface CollaborativeMouseTrackerProps {
    boardId: BoardId;
    style?: MantineStyleProp;
    children?: any;
    draggingObject: {
        list?: ListId;
        card?: CardId;
    }
}
const CollaborativeMouseTracker = (props: CollaborativeMouseTrackerProps) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const sockCtx = useSocket();
    const [roomUsers, setRoomUsersState] = useRoom(RoomType.MOUSE, props.boardId);
    
    useSocketListener<ServerSE.MOUSE_MOVE>(ServerSE.MOUSE_MOVE, (payload)=>{
        setRoomUsersState(prev => prev.map(user => {
            if(user.sid === payload.sid) {
                return {
                    ...user,
                    mouseRoomData: payload.data
                };
            }
            return user;
        }));
    });

    useSocketListener<ServerSE.USER_IDLE>(ServerSE.USER_IDLE, (payload)=>{
        setRoomUsersState(prev => prev.map(user => {
            if(user.sid === payload.sid) {
                return { ...user, idle: payload.idle };
            }
            return user;
        }));
    });

    const idle = useIdle(IDLE_TIMEOUT_MS);
    useEffect(()=>setIdle(idle), [idle]);

    const moveMouse = useThrottledCallback((pos: Position) => {
        sockCtx.volatileEmit<ClientSE.MOUSE_MOVE>(ClientSE.MOUSE_MOVE, {pos, draggingList: props.draggingObject.list, draggingCard: props.draggingObject.card});
    }, MOUSE_UPDATE_THROTTLE_MS);

    const setIdle = (idle: boolean) => {
        sockCtx.emit<ClientSE.USER_IDLE>(ClientSE.USER_IDLE, idle);
    }

    const handleMoveMouse: MouseEventHandler<HTMLDivElement> = (event) => {
        if(!ref.current){
            return;
        }
        const rect = event.currentTarget.getBoundingClientRect();
        const x = Math.max(0, Math.round(event.pageX - rect.left - (window.pageXOffset || window.scrollX)));
        const y = Math.max(0, Math.round(event.pageY - rect.top - (window.pageYOffset || window.scrollY)));
        moveMouse({ x: x, y: y });
    }

    return (
        <Box
            style={props.style}
            ref={ref}
            onMouseMove={handleMoveMouse}
        >
            {props.children}
            {
                roomUsers.map((user) => {
                    if (user.sid === sockCtx.sid || !user.mouseRoomData) { return null; }
                    return (
                        <UserCursor
                            key={user.sid}
                            position={{
                                x: user.mouseRoomData.pos.x + (ref.current?.getBoundingClientRect().left ?? 0),
                                y: user.mouseRoomData.pos.y + (ref.current?.getBoundingClientRect().top ?? 0)
                            }}
                            name={user.fullName}
                            avatarUrl={user.avatarUrl}
                            idle={user.idle}
                        />
                    );
                }) 
            }
        </Box>
    );

};

export default CollaborativeMouseTracker;
