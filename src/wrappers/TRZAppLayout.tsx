import React, { useEffect} from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import { useHotkeys, useLocalStorage} from "@mantine/hooks";
import { AppShell, Burger, Group, Tooltip, Kbd, Divider, Input, Text, Box, Stack, Title, Avatar, Button, Image, UnstyledButton, Menu } from "@mantine/core";
import { MdHomeFilled, MdOutlineSearch} from 'react-icons/md';
import { useSocket } from "@trz/contexts/socket-context";
import { useUser } from "@trz/contexts/user-context";
import { notify, NoteType } from "@trz/util/notifications";
import { LocalStorageKey } from "@mosaiq/terrazzo-common/constants";
import { useTRZ } from "@trz/contexts/TRZ-context";
import { fullName } from "@mosaiq/terrazzo-common/utils/textUtils";

interface TRZAppLayoutProps {
    children: any;
}
const TRZAppLayout = (props: TRZAppLayoutProps) => {
    const trz = useTRZ();
    const sockCtx = useSocket();
    const usr = useUser();
    const navigate = useNavigate();
    const location = useLocation();
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

    useHotkeys([
        ['[', ()=>{setSidebarCollapsed(!sidebarCollapsed)}],
        ['/', ()=>{}]
    ]);

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
                    height: `${trz.navbarHeight}px`,
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
                                <MdOutlineSearch size={"1rem"}/>
                                <Text size={"1rem"} style={{ paddingRight: "2rem" }}>Search all</Text>
                                <Text size={"1rem"}><Kbd>/</Kbd></Text>
                            </Group>
                        </Input>
                    </Box>
                    <Menu
                        transitionProps={{ transition: 'rotate-right', duration: 150 }}
                         position="bottom-end"
                         offset={2}
                         withArrow
                         arrowPosition="center"
                    >
                        <Menu.Target>
                            <UnstyledButton
                                onClick={()=>{
                                    console.log("User profile...")
                                }}
                                >
                                    <Avatar size={"2rem"} src={usr.userData?.profilePicture} color="initials" name={fullName(usr.userData)} />
                            </UnstyledButton>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item 
                                color="red"
                                onClick={()=>{
                                    usr.logoutAll();
                                }}
                            >Logout</Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
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
                        variant={location.pathname===`/dashboard` ? 'light' : 'subtle'}
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
                                            variant={location.pathname===`/org/${org.id}` ? 'light' : 'subtle'}
                                            px={0}
                                            style={{
                                                justifyContent: sidebarCollapsed ? "center" : "flex-start"
                                            }}
                                            onClick={()=>{
                                                navigate(`/org/${org.id}`);
                                            }}
                                        >
                                            <Avatar
                                                src={org.logoUrl ?? undefined}
                                                name={org.name}
                                                color={'initials'}
                                                display={"inline-block"}
                                                size={"sm"}
                                                mr={"5px"}
                                            />
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
                                                        variant={location.pathname===`/project/${project.id}` ? 'light' : 'subtle'}
                                                        onClick={()=>{
                                                            navigate(`/project/${project.id}`);
                                                        }}
                                                    >
                                                        <Avatar
                                                            src={project.logoUrl ?? undefined}
                                                            name={project.name}
                                                            color={'initials'}
                                                            display={"inline-block"}
                                                            size={"sm"}
                                                            mr={"5px"}
                                                        />
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
                {props.children}
            </AppShell.Main>
        </AppShell>
    );
};

export default TRZAppLayout;