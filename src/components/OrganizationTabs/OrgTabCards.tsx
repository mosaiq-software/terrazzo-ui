import React from "react";
import {Box, Title} from "@mantine/core";
import { BOARD_CARD_WIDTH, BoardListCard } from "@trz/components/BoardListCards";
import { ProjectHeader, ProjectId } from "@mosaiq/terrazzo-common/types";

interface OrgTabCardsProps {
    projects: ProjectHeader[];
    onClickProject: (projectId:ProjectId)=>void;
    onClickCreate: ()=>void;
}
export const OrgTabCards = (props: OrgTabCardsProps) => {
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
                        props.projects.map((project) => (
                            <BoardListCard 
                                key={project.id}
                                bgColor={'#121314'}
                                bgImage={project.logoUrl}
                                color="white"
                                title={project.name}
                                onClick={()=>props.onClickProject(project.id)}
                            />
                        ))
                    }
                    <BoardListCard 
                        centered
                        title="+ Add Project"
                        bgColor={'#121314'}
                        color="white"
                        onClick={props.onClickCreate}
                    />
                </Box>
            </Box>
        </Box>
    );
}