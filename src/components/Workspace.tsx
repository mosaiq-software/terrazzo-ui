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
    ScrollArea, Center,
} from "@mantine/core";
import {AddBoardListCard, BoardListCard} from "./BoardListCards";
import {AvatarRow} from "@trz/components/AvatarRow";
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
        <ScrollArea h='100vh'>
            <Box bg='#15161A' mih='100vh' pb='10vh'>
                <WorkspaceHeader/>
                <WorkspaceBody/>
            </Box>
        </ScrollArea>
    )
}

const WorkspaceHeader = (): React.JSX.Element => {
    const testUsers = Array.from({ length: 5 }).map(() => ({
        name: "John Doe",
        url: "https://avatars.githubusercontent.com/u/47070087?v=4"
    }))

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
                        <Flex ml='auto'
                              align='center'>
                            <AvatarRow users={testUsers} maxUsers={5}/>
                        </Flex>
                    </Tabs.List>
                </Tabs>
        </Box>
    )
}

const WorkspaceBody = (): React.JSX.Element => {
    return (
        <Center>
            <Box>
                <Title c='white' pb='20' order={2} maw='200'>Boards</Title>
                <Group maw='40%'>
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
                <Group justify='center' align='center' wrap='wrap' gap='1' w='fit-content' maw={380*4}>
                    {
                        boards.map((board: Board) => (
                            <BoardListCard board={board} color={'#121314'} key={board.id}/>
                        ))
                    }
                    <AddBoardListCard/>
                </Group>
            </Box>
        </Center>
    )
}

export default Workspace;