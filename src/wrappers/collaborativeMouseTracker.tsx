import React, { MouseEventHandler, useEffect, useRef, useState } from 'react';
import { useSocket } from "@trz/util/socket-context";
import UserCursor from "@trz/components/UserCursor";
import { getRoomCode } from '@mosaiq/terrazzo-common/utils/socketUtils';
import { RoomType } from '@mosaiq/terrazzo-common/socketTypes';
import { Box, MantineStyleProp } from '@mantine/core';

interface CollaborativeMouseTrackerProps {
    boardId: string;
    style?: MantineStyleProp;
    children?: any;
}
const CollaborativeMouseTracker = (props: CollaborativeMouseTrackerProps) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const sockCtx = useSocket();

    useEffect(() => {
        if (!sockCtx.connected) { return; }
        sockCtx.setRoom(getRoomCode(RoomType.MOUSE, props.boardId));
        return () => {
            sockCtx.setRoom(null);
        }
    }, [props.boardId, sockCtx.connected]);

    const moveMouse: MouseEventHandler<HTMLDivElement> = (event) => {
        if (!ref.current) {return;}
        const rect = event.currentTarget.getBoundingClientRect();
        const x = Math.max(0, Math.round(event.pageX - rect.left - (window.pageXOffset || window.scrollX)));
        const y = Math.max(0, Math.round(event.pageY - rect.top - (window.pageYOffset || window.scrollY)));
        sockCtx.moveMouse({
            x: x,
            y: y
        });
    }

    return (
        <Box
            style={props.style}
            ref={ref}
            onMouseMove={moveMouse}
        >
            {props.children}
            {
                sockCtx.roomUsers.map((user) => {
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
