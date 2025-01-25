import React, { useEffect } from "react";
import { useViewportSize, useDisclosure } from "@mantine/hooks";
import { Group, Title, Button, Burger, Avatar, ActionIcon } from "@mantine/core";

import DropDown from "./DropDown"
import NavBar from "./NavBar"

import "./../styles/NavBar.css"

const TRZNavBar = () => {
    const [opened, handlers] = useDisclosure(false);
    const { width } = useViewportSize();
    const isMobile = width < 768;

    useEffect(() => {
        if (!isMobile) { handlers.close(); }
    }, [isMobile]);

    return (
        <NavBar>
            { !isMobile ? 
                <>
                    <Group>
                        <Title className={"fit-content"} order={2}>Terrazzo</Title>
                        <button>Workspace</button>
                        <button>Create</button>
                    </Group>
                    <Group>
                        <ActionIcon/>
                        <Avatar key={"ttpham3"} name={"Thinh Pham"} color="initials" />
                    </Group>
                </>
                :
                <>
                    <Title className={"fit-content"} order={2}>Terrazzo</Title>
                    <Burger opened={opened} onClick={handlers.toggle}/>
                </>
            }
            { (!opened) ? <></> :
                <DropDown>
                    <a>Account</a>
                    <a>Notifications</a>
                    <a>Workspace</a>
                    <a>Create</a>
                </DropDown>
            }
        </NavBar>
    );
};

export default TRZNavBar;
