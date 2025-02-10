//Utility
import React from "react";
//Components
import {Box, Group, Paper, Text, ScrollArea, Title, Flex, UnstyledButton, Divider, Select, Button} from "@mantine/core";

const Home = (): React.JSX.Element => {
    return (
        <ScrollArea bg='#1d2022'
                    h='100vh'>
            <Box w='100vw'
                 pl='15vh'
                 mih='100vh'>
                <YourBoards/>
                <Title c='white' order={2} pb='25'>Your Workspaces</Title>
                <WorkspaceBoards/>
                <WorkspaceBoards/>
                <WorkspaceBoards/>
                <Divider mt='100'/>
            </Box>
        </ScrollArea>
    );
}

const YourBoards = (): React.JSX.Element => {
    return (
        <>
            <Group pt='50'
                   justify='space-between'>
                <Title order={2}
                       c='white'
                       p='10'>
                    Your Boards</Title>
                <ViewBoardButtons/>
            </Group>
            <Divider maw='94%' color='#5B5857' mt='20'/>
            <Group w='87vw'
                   pb='25'>
                <AddHomeListCard/>
                <HomeListCard/>
                <HomeListCard/>
                <HomeListCard/>
            </Group>
        </>
    );
}

const WorkspaceBoards = (): React.JSX.Element => {
    return (
        <>
            <Group pt='10'>
                <Title order={2}
                       c='white'
                       p='10'
                       pr='63vw'>
                    Terrazzo</Title>
                <Flex justify='flex-end'
                      gap='3em'
                      c='white'>
                    <Text>Boards</Text>
                    <Text>Members(10)</Text>
                    <Text>Settings</Text>
                </Flex>
            </Group>
            <Divider maw='94%' color='#5B5857'/>
            <Group w='87vw'>
                <AddHomeListCard/>
                <HomeListCard/>
                <HomeListCard/>
                <HomeListCard/>
            </Group>
        </>
    )
}

const HomeListCard = (): React.JSX.Element => {
    return (
        <UnstyledButton m='10'>
            <Paper bg='#121314'
                   w='20vw'
                   h='175'
                   radius='md'>
                <Text c='white'
                      p='10'>
                    [BRD] Board Name</Text>
            </Paper>
        </UnstyledButton>
    );
}

const AddHomeListCard = (): React.JSX.Element => {
    return (
        <UnstyledButton m='10'>
            <Paper bg='#121314'
                   w='20vw'
                   h='175'
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
        </UnstyledButton>
    );
}

const ViewBoardButtons = (): React.JSX.Element => {
    return (
        <Group pr='100'>
            <Select data={['All Views', 'Workspace views?', 'Mosaiq']}
                    defaultValue='All Views'
                    styles={() => ({
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
                    })}
            />
            <Divider orientation='vertical' color='gray'/>
            <Button size='compact-md' color='#27292E'>Recent</Button>
            <Button size='compact-md' color='#27292E'>Newest</Button>
            <Button size='compact-md' color='#27292E'>Oldest</Button>
            <Divider orientation='vertical' color='gray'/>
            <Button size='compact-md' color='#27292E'>Grid</Button>
            <Button size='compact-md' color='#27292E'>List</Button>
        </Group>
    )
}

export default Home;