import React from "react";
import { Badge, Box } from "@mantine/core";
import { useImageColor} from "@trz/util/useImageColor";
import { Position } from "@mosaiq/terrazzo-common/socketTypes";
import { GiArrowCursor } from "react-icons/gi";

interface UserCursorProps {
    position?: Position;
    color?: string;
    avatarUrl?: string;
    name: string;
    idle: boolean;
}

const UserCursor = (props: UserCursorProps) => {
    const [color, setColor] = React.useState<string|undefined>(props.color);
    const IDLE_COLOR = "#afafaf";
    const imgColor = useImageColor(props.avatarUrl);
    React.useEffect(() => {
        setColor(imgColor ?? props.color ?? "black");
    }, [imgColor]);
    
    if (!props.position) { return null; }
    
    return (
        <Box style={{
            position: "absolute",
            left: props.position.x,
            top: props.position.y,
        }}>
            <GiArrowCursor 
                size={"1.25rem"}
                color={props.idle ? IDLE_COLOR : color}
                
            />
            <Badge
                color={props.idle ? IDLE_COLOR : color}
                size="xs"
                ml={5}
                bd="1px solid #fff"
            >{props.name}</Badge>
        </Box>
    );
};

export default UserCursor;