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
        moveMouse();
    }, [x, y, ref.current]);

    useEffect(() => {
        if (!sockCtx.connected) { return; }
        sockCtx.setRoom(getRoomCode(RoomType.MOUSE, props.boardId));
        return () => {
            sockCtx.setRoom(null);
        }
    }, [props.boardId, sockCtx.connected]);

    const moveMouse = () => {
        const bounds = ref.current.getBoundingClientRect();
        if(!bounds) return;
        sockCtx.moveMouse({
            x: x / bounds.width,
            y: y / bounds.height
        });
    }

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
                            position={{
                                x: user.mouseRoomData.pos.x * (ref.current?.getBoundingClientRect().width ?? 0) + (ref.current?.getBoundingClientRect().left ?? 0),
                                y: user.mouseRoomData.pos.y * (ref.current?.getBoundingClientRect().height ?? 0) + (ref.current?.getBoundingClientRect().top ?? 0)
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
