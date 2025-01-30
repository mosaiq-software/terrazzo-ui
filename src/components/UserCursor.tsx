import React from "react";
import { Badge, Box } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowPointer } from "@fortawesome/free-solid-svg-icons";
import { useImageColor} from "@trz/util/useImageColor";

interface UserCursorProps {
    x: number;
    y: number;
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
        setColor(imgColor);
    }, [imgColor]);
    
    return (
        <Box style={{
            position: "absolute",
            left: props.x,
            top: props.y,
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