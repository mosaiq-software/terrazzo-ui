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
    UnstyledButton,
    Paper, TextInput
} from "@mantine/core";

const Workspace = (): React.JSX.Element => {
    return (
        <Box bg='#1d2022' h='100vh'>
            <WorkspaceHeader/>
            <WorkspaceBody/>
        </Box>
    )
}

const WorkspaceHeader = (): React.JSX.Element => {
    return (
            <Box p='50'>
                <Group gap='xl'
                       pl='50'>
                    <Avatar size='100'
                            radius='lg'/>
                    <Flex direction='column'>
                        <Title c='white'>Mosaiq</Title>
                        <Text c='#6C6C6C'>The Description of Workspace</Text>
                    </Flex>
                </Group>
                <Tabs pt='50'
                      defaultValue='Boards'>
                    <Tabs.List>
                        <Tabs.Tab value='Boards' color='#F2187E'><Text c='white' fw='bold'>Boards</Text></Tabs.Tab>
                        <Tabs.Tab value='Members' color='#F2187E'><Text c='white' fw='bold'>Members</Text></Tabs.Tab>
                        <Tabs.Tab value='Settings' color='#F2187E'><Text c='white' fw='bold'>Settings</Text></Tabs.Tab>
                        <Group ml='auto'>
                            <Avatar bg='#FFFFFF'/>
                            <Avatar bg='#FFFFFF'/>
                            <Avatar bg='#FFFFFF'/>
                            <Avatar bg='#FFFFFF'/>
                            <Avatar bg='#FFFFFF'/>
                        </Group>
                    </Tabs.List>
                </Tabs>
            </Box>
    )
}

const WorkspaceBody = (): React.JSX.Element => {
    return (
        <Box pl='10vw'>
            <Title c='white' pb='30'>Boards</Title>
            <Group maw='91%'>
                <Select data={['Sort by: Alphabetical A-Z', 'Date', 'Creator']}
                        defaultValue='Sort by: Alphabetical A-Z'
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
                <Button size='compact-md' color='#27292E'>Grid</Button>
                <Button size='compact-md' color='#27292E'>List</Button>
                <TextInput ml='auto' placeholder='Search for Board' styles={{ input: { backgroundColor: '#27292E', outline:'gray'} }}></TextInput>
            </Group>
            <Group gap='1' pt='20'>
                <AddHomeListCard/>
                <HomeListCard/>
                <HomeListCard/>
                <HomeListCard/>
                <HomeListCard/>
                <HomeListCard/>
            </Group>
        </Box>
    )
}

const HomeListCard = (): React.JSX.Element => {
    return (
        <UnstyledButton m='5'>
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
        <UnstyledButton m='5'>
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

export default Workspace;