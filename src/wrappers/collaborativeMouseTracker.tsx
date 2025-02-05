import React, { useEffect } from 'react';
import { useMouse, useIdle } from '@mantine/hooks';
import { useSocket } from "@trz/util/socket-context";
import UserCursor from "@trz/components/UserCursor";
import { useThrottledCallback } from "@mantine/hooks";

interface CollaborativeMouseTrackerProps {
    boardId: string;
}
const CollaborativeMouseTracker = (props: CollaborativeMouseTrackerProps) => {
    const IDLE_TIMEOUT_MS = 1000 * 60 * 3;
    const MOUSE_UPDATE_THROTTLE_MS = 250;
    const { x, y } = useMouse();
    const idle = useIdle(IDLE_TIMEOUT_MS);
    const sockCtx = useSocket();

    const throttledMoveMouse = useThrottledCallback(sockCtx.moveMouse, MOUSE_UPDATE_THROTTLE_MS);
    useEffect(() => {
        throttledMoveMouse({ x, y });
    }, [x, y]);
    useEffect(() => {
        sockCtx.setIdle(idle);
    }, [idle]);

    useEffect(() => {
        if (!sockCtx.connected) { return; }
        sockCtx.setRoom(props.boardId);
        return () => {
            sockCtx.setRoom(null);
        }
    }, [props.boardId, sockCtx.connected]);

    return (
        sockCtx.roomUsers.map((user) => {
            if (user.sid === sockCtx.sid) { return null; }
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
