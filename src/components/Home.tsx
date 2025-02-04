//Utility
import React from "react";
//Components
import {Box, Group, Paper, Text} from "@mantine/core";

const Home = (): React.JSX.Element => {
    return (
        <Box bg='#1d2022'
             h='100vh'
             w='100vw'
             p='lg'>
            <HomeList/>
            <HomeList/>
            <HomeList/>
            <HomeList/>
        </Box>
    );
}

const HomeList = (): React.JSX.Element => {
    return (
            <Group bg='gray'
                   m='lg'>
                <HomeListCard/>
                <HomeListCard/>
                <HomeListCard/>
                <HomeListCard/>
            </Group>
    );
}

const HomeListCard = (): React.JSX.Element => {
    return (
        <Paper bg='#121314'
               w='20vw'
               h='175'>
            <Text c='white'
                  p='10'>
                [BRD] Board Name</Text>
        </Paper>
    );
}

export default Home;