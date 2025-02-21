import React from "react";
import {Flex, Paper, Text, UnstyledButton, AspectRatio} from "@mantine/core";
import {useNavigate} from "react-router-dom";
import {Board} from "@mosaiq/terrazzo-common/types";
import {modals} from "@mantine/modals";

interface BoardListCardProps {
    color: string;
    board: Board;
}

export const BoardListCard = (props:BoardListCardProps): React.JSX.Element => {
    const navigate = useNavigate();

    function onClick() {
        navigate(`/boards/${props.board.id}`);
    }

    return (
        <UnstyledButton m='10'
                        onClick={onClick}>
            <AspectRatio ratio={301/150} miw='350'>
                <Paper bg={props.color}
                       radius='md'>
                    <Text c='white'
                          p='10'>
                        {"[" + props.board.boardCode + "] " + props.board.name}</Text>
                </Paper>
            </AspectRatio>
        </UnstyledButton>
    );
}

export const AddBoardListCard = (): React.JSX.Element => {
    return (
        <UnstyledButton m='10' onClick={() =>
            modals.openContextModal({
                modal: 'board',
                title: 'Create Board',
                innerProps: {},
            })
        }>
            <AspectRatio ratio={301/150} miw='350'>
                <Paper bg='#121314'
                       radius='md'>
                    <Flex justify='center'
                          align='center'
                          h='100%'
                          w='100%'>
                        <Text c='white'
                              fw={700}>
                            + Create New Board
                        </Text>
                    </Flex>
                </Paper>
            </AspectRatio>
        </UnstyledButton>
    );
}