import React from "react";
import {Flex, Paper, Text, UnstyledButton, AspectRatio} from "@mantine/core";

interface BoardListCardProps {
    color: string;
    title: string;
    onClick: ()=>void;
}
export const BoardListCard = (props:BoardListCardProps): React.JSX.Element => {
    return (
        <UnstyledButton m='10' onClick={props. onClick}>
            <AspectRatio ratio={301/150} miw='350'>
                <Paper bg={props.color} radius='md'>
                    <Text c='white' p='10'>{props.title}</Text>
                </Paper>
            </AspectRatio>
        </UnstyledButton>
    );
}

interface AddBoardListCardProps {
    onClick: ()=>void;
    title: string;
}
export const AddBoardListCard = (props: AddBoardListCardProps): React.JSX.Element => {
    return (
        <UnstyledButton m='10' onClick={props.onClick}>
            <AspectRatio ratio={301/150} miw='350'>
                <Paper bg='#121314' radius='md'>
                    <Flex justify='center' align='center' h='100%' w='100%'>
                        <Text c='white' fw={700}>
                            {props.title}
                        </Text>
                    </Flex>
                </Paper>
            </AspectRatio>
        </UnstyledButton>
    );
}