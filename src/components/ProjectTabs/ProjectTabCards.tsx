import React from "react";
import {Box, Title, Center, Loader} from "@mantine/core";
import { BOARD_CARD_WIDTH, BoardListCard } from "@trz/components/BoardListCards";
import { useSocket } from "@trz/contexts/socket-context";
import { BoardId, Project } from "@mosaiq/terrazzo-common/types";

interface ProjectTabCardsProps {
    projectData: Project;
    onClickBoard: (boardId: BoardId)=>void;
    onClickCreate: ()=>void;
}
export const ProjectTabCards = (props: ProjectTabCardsProps) => {
    const sockCtx = useSocket();

    return (
        <Box style={{
            width: "80%",
            display: "flex",
            flexDirection: 'column',
            flexWrap: 'nowrap',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
        }}>
            <Title c='white' pb='20' order={2} maw='200'>Boards</Title>
            <Box style={{
                width: "100%",
                display: "flex",
                justifyContent: "center"
            }}>
                <Box style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(auto-fill, ${BOARD_CARD_WIDTH + 10}px)`,
                    maxWidth: "100%"
                }}>
                    {
                        props.projectData.boards.map((board) => (
                            <BoardListCard 
                                key={board.id}
                                bgColor={'#121314'}
                                color="white"
                                title={board.name}
                                onClick={()=>props.onClickBoard(board.id)}
                            />
                        ))
                    }
                    <BoardListCard 
                        centered
                        title="+ Add Board"
                        bgColor={'#121314'}
                        color="white"
                        onClick={props.onClickCreate}
                    />
                </Box>
            </Box>
        </Box>
    );
}