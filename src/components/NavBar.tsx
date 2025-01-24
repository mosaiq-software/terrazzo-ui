import React from "react";
import './../styles/NavBar.css'

import { useViewportSize } from "@mantine/hooks";
import { Flex, Group, Title, Text, Button, Burger, Avatar, ActionIcon } from "@mantine/core";

type Props = { 
    children?: React.ReactNode;
    className?: String;
}

// This is a temporary rewrite of the NavBar to support resizing. 

// TODO: 
// - Copy over Cameron's styling 
// - Make NavBarCollapse and NavBar to be more generic
// - Refactor components here to their own files
const NavBar = (props: Props) => {
    return (
        <div className="navb-container">
            <div className="navb-layout">
                <Title className={"fit-content"} order={2}>Terrazzo</Title>
                <NavBarCollapse>
                    <Flex justify="flex-start" className="fit-content">
                        <Button>Workspace</Button>
                    </Flex>
                    <div className="flex-grow"/>
                    <Group>
                        <ActionIcon/>
                        <Avatar key={"ttpham3"} name={"Thinh Pham"} color="initials" />
                    </Group>
                </NavBarCollapse>
            </div>
        </div>
    );
};


const NavBarCollapse = (props: Props) => {
    const { width } = useViewportSize();
    const isMobile = width < 768;

    return (
        <>
            { !isMobile ? (props.children) :
                <>
                    <div className="flex-grow"/>
                    <Flex justify="flex-end">
                        <Burger/>
                    </Flex>
                </>
            }
        </>
    );
};


const TRZNavBar = (props: Props) => {
    return (
        <NavBar/>
    );
};

export default TRZNavBar;
