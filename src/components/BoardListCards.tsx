import React from "react";
import {Flex, Paper, Text, UnstyledButton, AspectRatio} from "@mantine/core";
import { useHover } from "@mantine/hooks";

interface BoardListCardProps {
    bgColor: string;
    color: string;
    title: string;
    onClick: ()=>void;
    centered?: boolean;
}
export const BoardListCard = (props:BoardListCardProps): React.JSX.Element => {
    const { hovered, ref } = useHover();
    return (
        <Paper
            ref={ref}
            bg={props.bgColor}
            w='350'
            h='150'
            radius='md'
            m='10'
            shadow={hovered ? "lg" : "sm"}
            onClick={props.onClick}
            style={{
                transition:"filter 200ms, transform 200ms, box-shadow 200ms",
                transform: `translateY(${hovered ? -5 : 0}px)`,
                filter: `brightness(${hovered ? .75 : 1})`,
            }}
        >
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