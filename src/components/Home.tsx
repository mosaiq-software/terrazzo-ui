//Utility
import React from "react";
//Components
import {Box, Group, ScrollArea, Title, Flex, Divider, Select, Button} from "@mantine/core";
import {AddBoardListCard, BoardListCard} from "./BoardListCards";
import {Board} from "@mosaiq/terrazzo-common/types";

interface WorkspaceBoardsProps {
    title: string;
}
//temporary until socket route is in place
const tempBoard: Board = {
    id:"8abc0689-7f7e-4b13-8554-e0c3d5daac6c",
    boardCode:"TRZ",
    name:"Terrazzo",
    lists:[],
    members:[],
    sprints:[],
    labels:[],
    archived:false,
    createdAt:0,
    totalCards:0
};
const boards:Board[] = [
    tempBoard,
    tempBoard,
    tempBoard
];
const tempWorkspace: string[] = [
    "Terrazzo",
    "Wiki",
    "Planner"
];

const Home = (): React.JSX.Element => {
    return (
        <ScrollArea bg='#15161A'
                    h='100vh'>
            <Box w='100vw'
                 pl='1vw'
                 mih='100vh'
                 pb='10vh'>
                <Flex justify='space-between'
                      py='25'>
                    <Title c='white' order={2}>Your Workspaces</Title>
                    <ViewBoardButtons/>
                </Flex>
                <Divider maw='98%' color='#5B5857' mb='15'/>
                {
                    tempWorkspace.map((workspace: string) => (
                        <WorkspaceBoards title={workspace}/>
                    ))
                }
            </Box>
        </ScrollArea>
    )
}

const WorkspaceBoards = (props:WorkspaceBoardsProps): React.JSX.Element => {
    return (
        <>
            <Group pt='10'
                   justify='space-between'>
                <Title order={3}
                       c='white'
                       p='20'>
                    {props.title}</Title>
            </Group>
            <Group w='100%' gap='1'>
                {
                    boards.map((board: Board) => (
                        <BoardListCard board={board} color={'#121314'}/>
                    ))
                }
                <AddBoardListCard/>
            </Group>
        </>
    )
}

const ViewBoardButtons = (): React.JSX.Element => {
    return (
        <Group pr='70'>
            <Select data={['All Views', 'Workspace views?', 'Mosaiq']}
                    defaultValue='All Views'
                    styles={{
                        input: {
                            backgroundColor: '#27292E', // Background color of the select box
                            color: 'white', // Text color
                            borderColor: '#1d2022', // Border color
                        },
                        dropdown: {
                            backgroundColor: '#27292E', // Background color of the dropdown
                            color: 'white', // Text color of the dropdown items
                        },
                        option: {
                            backgroundColor: '#27292E', // Background color of the dropdown items
                            color: 'white', // Text color of the dropdown items
                        }
                    }}
            />
            <Divider orientation='vertical' color='#868e96'/>
            <Button size='compact-md' color='#27292E' fw='500'>Recent</Button>
            <Button size='compact-md' color='#27292E' fw='500'>Newest</Button>
            <Button size='compact-md' color='#27292E' fw='500'>Oldest</Button>
            <Divider orientation='vertical' color='#868e96'/>
            <Button size='compact-md' color='#27292E' fw='500'>Grid</Button>
            <Button size='compact-md' color='#27292E' fw='500'>List</Button>
        </Group>
    )
}

export default Home;