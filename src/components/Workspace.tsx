//Utilities
import React from "react";
//Components
import {
    Box,
    Avatar,
    Group,
    Flex,
    Title,
    Text,
    Tabs,
    Select,
    Divider,
    Button,
    ScrollArea,
} from "@mantine/core";
import {AddBoardListCard, BoardListCard} from "./BoardListCards";
import {Board} from "@mosaiq/terrazzo-common/types";

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
    tempBoard,
    tempBoard,
    tempBoard,
    tempBoard
]

const Workspace = (): React.JSX.Element => {
    return (
        <ScrollArea>
            <Box bg='#15161A' h='100vh'>
                <WorkspaceHeader/>
                <WorkspaceBody/>
            </Box>
        </ScrollArea>
    )
}

const WorkspaceHeader = (): React.JSX.Element => {
    return (
        <Box p='25'>
            <Group gap='xl'
                   pl='50'>
                <Avatar size='75'
                        radius='lg'/>
                <Flex direction='column'>
                    <Title c='white'>Mosaiq</Title>
                    <Text c='#6C6C6C'>The Description of Workspace</Text>
                </Flex>
            </Group>
                <Tabs defaultValue='Boards' pt='30'>
                    <Tabs.List>
                        <Tabs.Tab value='Boards' color='#F2187E'><Text c='white' fw='bold'>Boards</Text></Tabs.Tab>
                        <Tabs.Tab value='Members' color='#F2187E'><Text c='white' fw='bold'>Members</Text></Tabs.Tab>
                        <Tabs.Tab value='Settings' color='#F2187E'><Text c='white' fw='bold'>Settings</Text></Tabs.Tab>
                        <Avatar.Group ml='auto'>
                            <Avatar bg='#FFFFFF'/>
                            <Avatar bg='#FFFFFF'/>
                            <Avatar bg='#FFFFFF'/>
                            <Avatar bg='#FFFFFF'/>
                            <Avatar bg='#FFFFFF'>+5</Avatar>
                        </Avatar.Group>
                    </Tabs.List>
                </Tabs>
        </Box>
    )
}

const WorkspaceBody = (): React.JSX.Element => {
    return (
        <Box pl='12vw'>
            <Title c='white' pb='20' order={2}>Boards</Title>
            <Group maw='91%'>
                <Select data={['Sort by: Alphabetical A-Z', 'Date', 'Creator']}
                        defaultValue='Sort by: Alphabetical A-Z'
                        size='xs'
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
                <Button size='compact-sm' color='#27292E' fw='500'>Grid</Button>
                <Button size='compact-sm' color='#27292E' fw='500'>List</Button>
                {/*<TextInput ml='auto' placeholder='Search for Board' styles={{ input: { backgroundColor: '#27292E', outline:'gray'} }}></TextInput> */}
            </Group>
            <Group gap='1' pt='20'>
                {
                    boards.map((board: Board) => (
                        <BoardListCard board={board} color={'#121314'}/>
                    ))
                }
                <AddBoardListCard/>
            </Group>
        </Box>
    )
}
/*
const WorkspaceAvatars = (): React.JSX.Element => {
    return (
        <Group pr='70'>
            <Tooltip.Group>
                <Avatar.Group>
                    <Tooltip label='User 1' withArrow>
                        <Avatar bg='#FFFFFF'/>
                    </Tooltip>
                    <Tooltip label='User 2' withArrow>
                        <Avatar bg='#FFFFFF'/>
                    </Tooltip>
                    <Tooltip label='User 3' withArrow>
                        <Avatar bg='#FFFFFF'/>
                    </Tooltip>
                    <Tooltip label='User 4' withArrow>
                        <Avatar bg='#FFFFFF'/>
                    </Tooltip>
                    <Tooltip label='User 5' withArrow>
                        <Avatar bg='#FFFFFF'/>
                    </Tooltip>
                    <Tooltip withArrow
                             label={
                        <>
                            <Text>User 6</Text>
                            <Text>User 7</Text>
                            <Text>User 8</Text>
                            <Text>User 9</Text>
                            <Text>User 10</Text>
                        </>
                    }>
                        <Avatar bg='#FFFFFF'>+5</Avatar>
                    </Tooltip>
                </Avatar.Group>
            </Tooltip.Group>
        </Group>
    )
}
*/
export default Workspace;