import React from "react";
import { Badge, Box } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowPointer } from "@fortawesome/free-solid-svg-icons";
import { useImageColor} from "@trz/util/useImageColor";
import { Position } from "@mosaiq/terrazzo-common/socketTypes";

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
            transform: "translate(0%, -50%)",
        }}>
            <FontAwesomeIcon icon={faArrowPointer} scale={2} color={props.idle ? IDLE_COLOR : color} />
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