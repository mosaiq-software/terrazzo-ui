//Utility
import React from "react";
//Components
import {Box, Group, Paper, Text, ScrollArea, Title, Flex, UnstyledButton, Divider} from "@mantine/core";

const Home = (): React.JSX.Element => {
    return (
        <ScrollArea bg='#1d2022'
                    h='100vh'>
            <Box w='100vw'
                 pl='15vh'
                 mih='100vh'>
                <HomeList/>
                <Divider mt='40'/>
                <HomeList/>
                <Divider mt='40'/>
                <HomeList/>
                <Divider mt='40'/>
                <HomeList/>
                <Divider mt='40'/>
                <Divider mt='40'/>
            </Box>
        </ScrollArea>
    );
}

const HomeList = (): React.JSX.Element => {
    return (
        <>
            <Group pt='50'>
                <Title order={2}
                       c='white'
                       p='10'
                       pr='61vw'>
                    Your Boards</Title>
                <Flex justify='flex-end'
                      gap='3em'
                      c='white'>
                    <Text>Boards</Text>
                    <Text>Members(10)</Text>
                    <Text>Settings</Text>
                </Flex>
            </Group>
            <Group w='87vw'>
                <AddHomeListCard/>
                <HomeListCard/>
                <HomeListCard/>
                <HomeListCard/>
                <HomeListCard/>
                <HomeListCard/>
            </Group>
        </>
    );
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

export default Home;