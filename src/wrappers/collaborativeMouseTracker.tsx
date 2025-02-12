import React, { useEffect } from 'react';
import { useMouse } from '@mantine/hooks';
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
    const { ref, x, y } = useMouse();
    const sockCtx = useSocket();

    useEffect(() => {
        sockCtx.moveMouse({x, y});
    }, [x, y]);

    useEffect(() => {
        if (!sockCtx.connected) { return; }
        sockCtx.setRoom(getRoomCode(RoomType.MOUSE, props.boardId));
        return () => {
            sockCtx.setRoom(null);
        }
    }, [props.boardId, sockCtx.connected]);

    return (
        <Box
            style={props.style}
            ref={ref}
        >
            {props.children}
            {
                sockCtx.roomUsers.map((user) => {
                    if (user.sid === sockCtx.sid || !user.mouseRoomData) { return null; }
                    return (
                        <UserCursor
                            key={user.sid}
                            position={user.mouseRoomData}
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
