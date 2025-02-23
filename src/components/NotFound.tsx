import { Box, Center, Stack, Title, Text } from "@mantine/core";
import React from "react";
import { NavLink } from "react-router-dom";

interface NotFoundProps {
    itemType: string;
}
export const NotFound = (props: NotFoundProps) => {
    return (
        <Center py="lg">
            <Stack>
                <Title order={1} c="white" ta="center">404</Title>
                <Title order={3} c="white" ta="center">This {props.itemType} can't be found</Title>
                <NavLink to="/dashboard" ><Text c="#9cdcfe">&lt; Back to Dashboard</Text></NavLink>
            </Stack>
        </Center>
    )
}