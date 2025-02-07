import React, {useEffect} from 'react';
import {Box} from '@mantine/core';
import { useImageColor } from '@trz/util/useImageColor';

interface UserCaretProps {
    color?: string;
    avatarUrl?: string;
    name? : string;
    idle: boolean;
    x: number;
    y: number;
}
export const UserCaret = (props: UserCaretProps) => {
    const [color, setColor] = React.useState<string|undefined>(props.color);
    const IDLE_COLOR = "#afafaf";
    const imgColor = useImageColor(props.avatarUrl);

    useEffect(() => {
        setColor(imgColor ?? props.color ?? "black");
    }, [imgColor]);

    return (
        <Box
            pos="absolute"
            top={props.y+2}
            left={props.x}
            w="2px"
            h="1lh"
            bg={ props.idle ? IDLE_COLOR : color }
            display="inline-block"
            style={{
                height: '100%',
                lineHeight: "1",
                fontFamily: 'monospace',
                zIndex: 10
            }}
        />
    )
}