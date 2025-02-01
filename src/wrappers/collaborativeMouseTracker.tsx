import React from "react";
import { useMouse, useIdle } from '@mantine/hooks';
import { useSocket } from "@trz/util/socket-context";
import UserCursor from "@trz/components/UserCursor";
import { useThrottledCallback } from "@mantine/hooks";


const CollaborativeMouseTracker = () => {
    const IDLE_TIMEOUT_MS = 1000 * 60 * 3;
    const MOUSE_UPDATE_THROTTLE_MS = 250;
    const { x, y } = useMouse();
    const idle = useIdle(IDLE_TIMEOUT_MS);
    const sockCtx = useSocket();

    const throttledMoveMouse = useThrottledCallback(sockCtx.moveMouse, MOUSE_UPDATE_THROTTLE_MS);
    React.useEffect(() => {
        throttledMoveMouse(x, y);
    }, [x, y]);
    React.useEffect(() => {
        sockCtx.setIdle(idle);
    }, [idle]);

    return (
        sockCtx.roomUsers.map((user) => {
            if (user.sid === sockCtx.sid) { return null; }
            if (!user.mouse.x || !user.mouse.y) { return null; }
            return (
                <UserCursor
                    key={user.sid}
                    x={user.mouse.x}
                    y={user.mouse.y}
                    name={user.fullName}
                    avatarUrl={user.avatarUrl}
                    idle={user.idle}
                />
            );
        }) 
    );

};

export default CollaborativeMouseTracker;
