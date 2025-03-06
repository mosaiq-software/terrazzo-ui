import React from "react";
import {Box, Title, Center, Loader} from "@mantine/core";
import { BOARD_CARD_WIDTH, BoardListCard } from "@trz/components/BoardListCards";
import { useSocket } from "@trz/contexts/socket-context";
import { useNavigate } from "react-router-dom";
import { modals } from "@mantine/modals";

interface ProjectTabCardsProps {

}
export const ProjectTabCards = (props: ProjectTabCardsProps) => {
    const sockCtx = useSocket();
    const navigate = useNavigate();

    if(!sockCtx.projectData) {
        return null;
    }

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
                        sockCtx.projectData.boards.map((board) => (
                            <BoardListCard 
                                key={board.id}
                                bgColor={'#121314'}
                                color="white"
                                title={board.name}
                                onClick={()=>{
                                    navigate("/board/"+board.id);
                                }}
                            />
                        ))
                    }
                    {
                        (!sockCtx.projectData) && 
                        <Center w="100%" h="100%">
                            <Loader type="bars"/>
                        </Center>
                    }
                    <BoardListCard 
                        centered
                        title="+ Add Board"
                        bgColor={'#121314'}
                        color="white"
                        onClick={() =>
                            modals.openContextModal({
                                modal: 'board',
                                title: 'Create Board',
                                innerProps: {projectId: sockCtx.projectData?.id},
                            })
                        }
                    />
                </Box>
            </Box>
        </Box>
    );
}