import React from 'react';
import {Box, Group, Tooltip, Text, Avatar} from '@mantine/core';
import { useImageColor } from '@trz/hooks/useImageColor';

interface UserCaretProps {
    color?: string;
    avatarUrl?: string;
    name? : string;
    idle: boolean;
    x: number;
    y: number;
}
export const UserCaret = (props: UserCaretProps) => {
    const IDLE_COLOR = "#afafaf";
    const imgColor = useImageColor(props.avatarUrl);

    return (
        <Tooltip
            disabled={!props.name}
            label={
                <Group gap={4}>
                    {
                        props.avatarUrl && <Avatar size='xs' src={props.avatarUrl} />
                    }
                    <Text size='xs'>{props.name}</Text>
                </Group>
            }
            closeDelay={1000}
            arrowPosition="side"
            arrowOffset={5}
            arrowSize={8}
            position='top-start'
            offset={{ mainAxis: 2, crossAxis: 0 }}
            p={6}
            radius='100 100 100 0'
            transitionProps={{ transition: 'pop-bottom-left', duration: 300 }}
            color={ props.idle ? IDLE_COLOR : imgColor ?? props.color ?? "black" }
        >
            <Box
                pos="absolute"
                top={props.y+2}
                left={props.x}
                w="2px"
                h="1lh"
                bg={ props.idle ? IDLE_COLOR : imgColor ?? props.color ?? "black" }
                display="inline-block"
                style={{
                    height: '100%',
                    lineHeight: "1",
                    fontFamily: 'monospace',
                    zIndex: 10
                }}
            >
                <Box
                    h={4}
                    w={4}
                    top={-3}
                    pos={'absolute'}
                    bg={ props.idle ? IDLE_COLOR : imgColor ?? props.color ?? "black" }
                />
            </Box>
        </Tooltip>
    )
}