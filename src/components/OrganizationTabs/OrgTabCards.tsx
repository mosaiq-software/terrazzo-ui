import React from "react";
import {Box, Title, Center, Loader} from "@mantine/core";
import { BOARD_CARD_WIDTH, BoardListCard } from "@trz/components/BoardListCards";
import { useSocket } from "@trz/contexts/socket-context";
import { useNavigate } from "react-router-dom";
import { modals } from "@mantine/modals";

interface OrgTabCardsProps {

}
export const OrgTabCards = (props: OrgTabCardsProps) => {
    const sockCtx = useSocket();
    const navigate = useNavigate();

    if(!sockCtx.orgData) {
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
            <Title c='white' pb='20' order={2} maw='200'>Projects</Title>
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
                        sockCtx.orgData.projects.map((project) => (
                            <BoardListCard 
                                key={project.id}
                                bgColor={'#121314'}
                                bgImage={project.logoUrl}
                                color="white"
                                title={project.name}
                                onClick={()=>{
                                    navigate("/project/"+project.id);
                                }}
                            />
                        ))
                    }
                    {
                        (!sockCtx.orgData) && 
                        <Center w="100%" h="100%">
                            <Loader type="bars"/>
                        </Center>
                    }
                    <BoardListCard 
                        centered
                        title="+ Add Project"
                        bgColor={'#121314'}
                        color="white"
                        onClick={() =>
                            modals.openContextModal({
                                modal: 'project',
                                title: 'Create Project',
                                innerProps: {orgId: sockCtx.orgData?.id},
                            })
                        }
                    />
                </Box>
            </Box>
        </Box>
    );
}