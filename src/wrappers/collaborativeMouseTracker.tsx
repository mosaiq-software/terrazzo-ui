import React, { useEffect } from 'react';
import { useMouse, useIdle } from '@mantine/hooks';
import { useSocket } from "@trz/util/socket-context";
import UserCursor from "@trz/components/UserCursor";
import { useThrottledCallback } from "@mantine/hooks";

interface CollaborativeMouseTrackerProps {
    boardId: string;
}
const CollaborativeMouseTracker = (props: CollaborativeMouseTrackerProps) => {
    const { x, y } = useMouse();
    const sockCtx = useSocket();

    useEffect(() => {
        sockCtx.moveMouse({ x, y });
    }, [x, y]);

    useEffect(() => {
        if (!sockCtx.connected) { return; }
        sockCtx.setRoom("mouse-"+props.boardId);
        return () => {
            sockCtx.setRoom(null);
        }
    }, [props.boardId, sockCtx.connected]);

    return (
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
    );

};

export default CollaborativeMouseTracker;
