import React from "react";
import { NavLink, useNavigate, useLocation, useParams } from "react-router-dom"
import { useHotkeys, useLocalStorage} from "@mantine/hooks";
import { AppShell, Burger, Group, Tooltip, Kbd, Divider, Input, Text, Box, Stack, Title, Avatar, Button, Image, UnstyledButton, Menu, Popover, Indicator, Notification, ScrollAreaAutosize } from "@mantine/core";
import { MdHomeFilled, MdNotificationsNone, MdOutlineSearch, MdOutlineSettings} from 'react-icons/md';
import { useSocket } from "@trz/contexts/socket-context";
import { useUser } from "@trz/contexts/user-context";
import { notify, NoteType } from "@trz/util/notifications";
import { EntityType, LocalStorageKey, RoleNames } from "@mosaiq/terrazzo-common/constants";
import { useTRZ } from "@trz/contexts/TRZ-context";
import { fullName } from "@mosaiq/terrazzo-common/utils/textUtils";
import { replyInvite} from "@trz/emitters/all"
import {useDashboard} from "@trz/contexts/dashboard-context";
import { useSocketListener } from "@trz/hooks/useSocketListener";
import { ServerSE } from "@mosaiq/terrazzo-common/socketTypes";
import { AutoComplete } from '@trz/components/AutoComplete/AutoComplete'

interface TRZAppLayoutProps {
    children: any;
}
const TRZAppLayout = (props: TRZAppLayoutProps) => {
    const trz = useTRZ();
    const sockCtx = useSocket();
    const usr = useUser();
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
	const boardId = params.boardId;
    const {userDash, updateUserDash} = useDashboard();
    const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage<boolean>({ key: LocalStorageKey.SIDEBAR_COLLAPSED, defaultValue: false });

    useHotkeys([
        ['[', ()=>{setSidebarCollapsed(!sidebarCollapsed)}],
        ['/', ()=>{}]
    ]);

    useSocketListener<ServerSE.RECEIVE_INVITE>(ServerSE.RECEIVE_INVITE, (payload)=>{
        notify(NoteType.INVITE_RECEIVED, [fullName(payload.fromUser), payload.entity.name],{
            primary: async ()=>{
                try {
                    replyInvite(sockCtx, payload.id, true);
                } catch (e) {
                    notify(NoteType.GENERIC_ERROR, e);
                }
            },
            secondary: ()=>{
                try {
                    replyInvite(sockCtx, payload.id, false);
                } catch (e) {
                    notify(NoteType.GENERIC_ERROR, e);
                }
            }
        });
    });

    return (
        <AppShell
            withBorder={false}
            transitionDuration={200}
            navbar={{
                width: sidebarCollapsed ? "50px" : "300px",
                breakpoint: "0",
            }}
        >
            <AppShell.Header 
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    width: "100vw",
                    height: `${trz.navbarHeight}px`,
                    padding: "10px",
                    paddingRight: "2rem",
                    background : "#0c0c10"
                }}
            >
                <Group>
                    { trz.boardData &&
                        <Text>{trz.boardData?.name}</Text>
                    }
                    {
                        boardId &&
                        <>
                            <Tooltip label="Board Settings" openDelay={500} withArrow>
                                <Button 
                                    variant="subtle" 
                                    w="fit-content"
                                    onClick={()=>{
                                        if(location.pathname.endsWith("/settings")){
                                            navigate(`/board/${boardId}`)
                                        } else{
                                            navigate(`/board/${boardId}/settings`)
                                        }
                                    }}
                                >
                                    <MdOutlineSettings size={"1.25rem"} color="white"/>
                                </Button>
                            </Tooltip>
                            <Divider orientation="vertical" color="white" my="3px"/>
                        </>
                    }
                    <Popover
                        withArrow
                        arrowPosition="center"
                    >
                        <Popover.Target>
                             <Tooltip label="Notifications" openDelay={500} withArrow>
                                <Button variant="subtle" w="fit-content">
                                    <Indicator disabled={!(userDash?.invites.length)} label={userDash?.invites.length ?? undefined} size={16}>
                                        <MdNotificationsNone size={"1.25rem"} color="white"/>
                                    </Indicator>
                                </Button>
                            </Tooltip>
                        </Popover.Target>
                        <Popover.Dropdown>
                            <ScrollAreaAutosize mah="60vh">
                            <Stack w="30rem">
                                {
                                    userDash?.invites.map(i=>{
                                        return (
                                            <Notification 
                                                key={i.id}
                                                withCloseButton={false}
                                                title={
                                                    <Group>
                                                        <Avatar
                                                            src={i.entity.logoUrl ?? undefined}
                                                            name={i.entity.name}
                                                            color={'initials'}
                                                            display={"inline-block"}
                                                            size={"sm"}
                                                            mr={"5px"}
                                                        />
                                                        <Text>Invite to {i.entity.name}</Text>
                                                    </Group>
                                                }
                                            >
                                                <Text py="sm">{fullName(i.fromUser)} ({i.fromUser.username}) has invited you to join the {i.entity.name} {i.entityType===EntityType.ORG?"Organization":"Project"} as a {RoleNames[i.userRole]}</Text>
                                                <Group>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={()=>{
                                                            try{
                                                                replyInvite(sockCtx, i.id, false);
                                                            } catch (e) {
                                                                notify(NoteType.GENERIC_ERROR, e)
                                                            }
                                                        }}
                                                    >Decline</Button>
                                                    <Button
                                                        variant="filled"
                                                        size="sm"
                                                        onClick={()=>{
                                                            try{
                                                                replyInvite(sockCtx, i.id, true);
                                                                notify(NoteType.JOINED_ENTITY, [i.entity.name]);
                                                                if(i.entityType === EntityType.ORG){
                                                                    navigate("/org/"+i.entity.id)
                                                                } else if (i.entityType === EntityType.PROJECT) {
                                                                    navigate("/project/"+i.entity.id)
                                                                }
                                                            } catch (e) {
                                                                notify(NoteType.GENERIC_ERROR, e)
                                                            }
                                                        }}
                                                    >Accept</Button>
                                                </Group>
                                            </Notification>
                                        )
                                    })
                                }
                                {
                                    (!userDash?.invites.length) &&
                                    <Title ta="center" order={5}>No notifications to show!</Title>
                                }
                            </Stack>
                            </ScrollAreaAutosize>
                        </Popover.Dropdown>
                    </Popover>
                    <AutoComplete/>
                    <Menu
                        transitionProps={{ transition: 'fade-down', duration: 150 }}
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
                                    <Avatar size={"1.75rem"} src={usr.userData?.profilePicture} color="initials" name={fullName(usr.userData)} />
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
                style={{
                    transition: "width 200ms"
                }}
            >
                <Stack
                    px={sidebarCollapsed ? "10px" : "15px"}
                    style={{
                        transition: "padding 200ms"
                    }}
                    mt="xs"
                >
                    <Group
                        align="center"
                        justify={"space-between"}
                        wrap="nowrap"
                        px={sidebarCollapsed ? "5px" : "0px"}
                        style={{
                            transition: "padding 200ms"
                        }}
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
                        <NavLink to={"/"}>
                            <Image
                                src="https://mosaiq.dev/assets/terrazzo-logo.svg"
                                alt="terrazzo"
                                style={{
                                    transition: "width 200ms",
                                    width: sidebarCollapsed ? "0px" : "100px",
                                    overflow: "clip",
                                }}
                            />
                        </NavLink>
                    </Group>
                    <Divider />
                    <Tooltip
                        disabled={!sidebarCollapsed}
                        label={"Dashboard"}
                        withArrow
                        arrowPosition="side"
                        position="right"
                        openDelay={700}
                        closeDelay={200}
                    >
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
                            <MdHomeFilled size={26} color="#fff"/>
                            <Text
                                c="#fff"
                                pl={sidebarCollapsed ? "0px" : "5px"}
                                style={{
                                    transition: "width 200ms",
                                    textWrap: "nowrap",
                                    textAlign: "left",
                                    width: sidebarCollapsed ? "0px" : "250px",
                                }}
                            >Dashboard</Text>
                        </Button>
                    </Tooltip>
                    <Divider />
                    {
                        userDash?.organizations.filter((e)=>!e.archived).map((org)=>{
                            return (
                                <Box key={org.id} >
                                    <Group align="center" justify="flex-start" pt="0" w="100%">
                                        <Tooltip
                                            disabled={!sidebarCollapsed}
                                            label={org.name}
                                            withArrow
                                            arrowPosition="side"
                                            position="right"
                                            openDelay={700}
                                            closeDelay={200}
                                        >
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
                                                />
                                                <Text
                                                    c="#fff"
                                                    pl={sidebarCollapsed ? "0px" : "5px"}
                                                    style={{
                                                        transition: "width 200ms",
                                                        textWrap: "nowrap",
                                                        textAlign: "left",
                                                        width: sidebarCollapsed ? "0px" : "250px",
                                                    }}
                                                >{org.name}</Text>
                                            </Button>
                                        </Tooltip>
                                    </Group>
                                    <Stack
                                        gap={0}
                                    >{
                                        org.projects.filter((e)=>!e.archived).map((project)=>{
                                            return (
                                                <Group
                                                    key={project.id}
                                                    align="center"
                                                    justify="flex-start"
                                                    p="0"
                                                    ml="sm"
                                                    w="100%"
                                                    style={{
                                                        overflow: "hidden",
                                                        height: sidebarCollapsed ? "0px" : "36px",
                                                        transition: "height 200ms",
                                                    }}
                                                >
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
                                                        />
                                                        <Text
                                                            c="#fff"
                                                            pl={sidebarCollapsed ? "0px" : "5px"}
                                                            style={{
                                                                transition: "width 200ms",
                                                                textWrap: "nowrap",
                                                                textAlign: "left",
                                                                width: sidebarCollapsed ? "0px" : "calc(90% - 5px)",
                                                            }}
                                                        >{project.name}</Text>
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
