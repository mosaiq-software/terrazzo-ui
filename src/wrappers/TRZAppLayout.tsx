import React, { useEffect, useMemo, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom"
import { useDisclosure, useHotkeys, useLocalStorage, useWindowScroll } from "@mantine/hooks";
import { AppShell, Burger, Flex, Group, Tooltip, ActionIcon, Kbd, Divider, Input, Text, Box, Stack, Tree, TreeNodeData, Title, Avatar, Button, Image } from "@mantine/core";
import { MdHome, MdHomeFilled, MdOutlineAccountCircle, MdOutlineSearch, MdViewKanban } from 'react-icons/md';
import { useSocket } from "@trz/contexts/socket-context";
import { useUser } from "@trz/contexts/user-context";
import { UserDash } from "@mosaiq/terrazzo-common/types";
import { notify, NoteType } from "@trz/util/notifications";
import { LocalStorageKey } from "@mosaiq/terrazzo-common/constants";

interface TRZAppLayoutProps {
    children: any;
}
const TRZAppLayout = (props: TRZAppLayoutProps) => {
    const sockCtx = useSocket();
    const usr = useUser();
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage<boolean>({ key: LocalStorageKey.SIDEBAR_COLLAPSED, defaultValue: false });

    useEffect(() => {
        let strictIgnore = false;
        const fetchOrgData = async () => {
            await new Promise((resolve)=>setTimeout(resolve, 0));
            if(strictIgnore){
                return;
            }
            try{
                if(!usr.userData?.id){
                    notify(NoteType.NOT_LOGGED_IN);
                    return;
                }
                sockCtx.syncUserDash();
            } catch(err) {
                notify(NoteType.DASH_ERROR, err);
                return;
            }
        };
        fetchOrgData();
        return ()=>{
            strictIgnore = true;
        }
    }, [sockCtx.connected, usr.userData?.id]);

    return (
        <AppShell
            withBorder={false}
            transitionDuration={200}
            navbar={{
                width: sidebarCollapsed ? "50px" : "200px",
                breakpoint: "sm",
            }}
        >
            <AppShell.Header 
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    width: "100vw",
                    height: "50px",
                    padding: "10px",
                    background : "#0c0c10"
                }}
            >
                <Group>
                    <Box>
                        <Input
                            pointer
                            component={"button"}
                            onClick={()=>{}}>
                            <Group align={"center"}>
                                <MdOutlineSearch />
                                <Text size={"md"} style={{ paddingRight: "2rem" }}>Search all</Text>
                                <Text size={"xs"}>Ctrl + K</Text>
                            </Group>
                        </Input>
                    </Box>
                    <Box>
                        <Tooltip
                            offset={{ mainAxis: 5 }}
                            label={
                                <Text size={"sm"}>Account</Text>
                            }>
                            <ActionIcon
                                size={"input-sm"}
                                variant={"default"}
                                aria-label={"Login to Account Button"}>
                                <NavLink to={"/login"}>
                                    <MdOutlineAccountCircle size={"1.5rem"} />
                                </NavLink>
                            </ActionIcon>
                        </Tooltip>
                    </Box>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar
                bg="#0c0c10"
            >
                <Stack
                    px={sidebarCollapsed ? "5" : "sm"}
                >
                    <Group
                        align="center"
                        justify={sidebarCollapsed ? "center" : "space-between"}
                        p="xs"
                    >
                        <Tooltip
                            offset={{ mainAxis: 5 }}
                            label={
                                <Group align={"center"}>
                                    <Text size={"sm"}>Collapse Sidebar</Text>
                                    <Kbd>[</Kbd>
                                </Group>
                            }>
                            <Burger
                                transitionDuration={200}
                                opened={!sidebarCollapsed}
                                size="sm"
                                color="white"
                                onClick={()=>{setSidebarCollapsed(!sidebarCollapsed)}}
                            />
                        </Tooltip>
                        {!sidebarCollapsed && <NavLink to={"/"}><Image src="https://mosaiq.dev/assets/terrazzo-logo.svg" alt="terrazzo"/></NavLink>}
                    </Group>
                    <Divider />
                    <Button
                        variant="subtle"
                        onClick={()=>{
                            navigate(`/dashboard`);
                        }}
                        display={"flex"}
                        px={0}
                        style={{
                            justifyContent: sidebarCollapsed ? "center" : "flex-start",
                            alignItems: "baseline"
                        }}
                    >
                        <MdHomeFilled size={26} style={{marginRight: "5px"}} color="#fff"/>{!sidebarCollapsed && <Title order={5} c="#fff">Dashboard</Title>}
                    </Button>
                    <Divider />
                    {
                        sockCtx.userDash?.organizations.filter((e)=>!e.archived).map((org)=>{
                            return (
                                <Box key={org.id} >
                                    <Group align="center" justify="flex-start" pt="0" w="100%">
                                        <Button
                                            w="100%"
                                            display={"flex"}
                                            variant="subtle"
                                            px={0}
                                            style={{
                                                justifyContent: sidebarCollapsed ? "center" : "flex-start"
                                            }}
                                            onClick={()=>{
                                                navigate(`/org/${org.id}`);
                                            }}
                                        >
                                            <Avatar src={org.logoUrl} display={"inline-block"} size={"sm"} mr={"5px"}/>
                                            {!sidebarCollapsed && <Title order={5} c="#fff">{org.name}</Title>}
                                        </Button>
                                    </Group>
                                    <Stack
                                        gap={0}
                                    >{
                                        !sidebarCollapsed && org.projects.filter((e)=>!e.archived).map((project)=>{
                                            return (
                                                <Group key={project.id} align="center" justify="flex-start" p="0" ml="sm" w="100%">
                                                    <Button
                                                        w="100%"
                                                        display={"flex"}
                                                        variant="subtle"
                                                        onClick={()=>{
                                                            navigate(`/project/${project.id}`);
                                                        }}
                                                    >
                                                        <Avatar src={project.logoUrl} display={"inline-block"} size={"sm"} mr={"sm"}/>
                                                        <Title order={6} c="#fff">{project.name}</Title>
                                                    </Button>
                                                </Group>
                                            )
                                        })
                                    }</Stack>
                                </Box>
                            )
                        })
                    }
                </Stack>
            </AppShell.Navbar>

            <AppShell.Main
                mt={"50px"}
            >
                {/* <TRZModalSearch
                    opened={modalOpened}
                    onClose={closeModal}
                /> */}
                {props.children}
            </AppShell.Main>
        </AppShell>
    );
};

export default TRZAppLayout;