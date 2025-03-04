import React from "react";
import { Flex, Paper, Text, Button, UnstyledButton, AspectRatio } from "@mantine/core";
import { NoteType, notify } from "@trz/util/notifications";
import { useSocket } from "@trz/util/socket-context";


interface BoardListCardProps {
    bgColor: string;
    color: string;
    title: string;
    onClick: () => void;
    centered?: boolean;
}
export const BoardListCard = (props: BoardListCardProps): React.JSX.Element => {
    return (
        <Paper bg={props.bgColor} w='350' h='150' radius='md' m='10' shadow="sm" onClick={props.onClick}>
            {
                props.centered &&
            <Flex justify='center' align='center' h='100%' w='100%'>
                <Text c={props.color} fw={700}>
                    {props.title}
                </Text>
            </Flex>
            }{
                !props.centered && <Text c={props.color} p='10'>{props.title}</Text>
            }
        </Paper>
    );
}