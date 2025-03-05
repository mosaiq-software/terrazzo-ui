import React, { useEffect } from "react";
import {Box, ScrollArea, Title, Flex, Divider, Text, Loader, Center, Paper, Kbd, Button, Tooltip} from "@mantine/core";
import { BoardListCard} from "@trz/components/BoardListCards";
import { useNavigate } from "react-router-dom";
import { useSocket } from "@trz/contexts/socket-context";
import { NoteType, notify } from "@trz/util/notifications";
import { useUser } from "@trz/contexts/user-context";
import { useClipboard } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { useTRZ } from "@trz/contexts/TRZ-context";

const HomePage = (): React.JSX.Element => {
    const usr = useUser();
    const sockCtx = useSocket();
    const trz = useTRZ();
	const navigate = useNavigate();
    const clipboard = useClipboard();

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

    const orgs = sockCtx?.userDash?.organizations.filter((e)=>!e.archived);
    const orgsArch = sockCtx?.userDash?.organizations.filter((e)=>e.archived);
    const projects = sockCtx?.userDash?.standaloneProjects.filter((e)=>!e.archived);
    const projectsArch = sockCtx?.userDash?.standaloneProjects.filter((e)=>e.archived);

    return (
        <ScrollArea 
            bg='#15161A'
            h={`calc(100vh - ${trz.navbarHeight}px)`}
        >
            <Box h="100%" py='2rem' maw="1200px" miw="90%" style={{
                width:"100%",
                display: "flex",
                flexDirection: "column",
                flexWrap: "nowrap",
                alignItems: 'center'
            }}>
                <Flex justify='space-between' py='25'>
                    <Title c='white' order={2} display={"block"}>Welcome {usr.userData?.firstName ?? ""}</Title>
                </Flex>
                <Divider color='#5B5857' mb='15'/>
                <Box style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column"
                }}>
                    <Title c='white' order={4}>Organizations</Title>
                    <Box style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, 360px)",
                        maxWidth: "100%"
                    }}>{
                        orgs && orgs.map((org) => {
                            return (
                                <BoardListCard
                                    key={org.id}
                                    title={org.name}
                                    bgColor="#4b598c"
                                    bgImage={org.logoUrl}
                                    color="white"
                                    onClick={()=>{
                                        navigate("/org/"+org.id);
                                    }}
                                />
                            )
                        })
                    }</Box>
                    <Title c='white' order={4}>Projects</Title>
                    <Box style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, 360px)",
                        maxWidth: "100%"
                    }}>{
                        projects && projects.map((project) => {
                            return (
                                <BoardListCard
                                    key={project.id}
                                    title={project.name}
                                    bgColor="#4b598c"
                                    bgImage={project.logoUrl}
                                    color="white"
                                    onClick={()=>{
                                        navigate("/project/"+project.id);
                                    }}
                                />
                            )
                        })
                    }</Box>
                    <Title c='white' order={4}>Archived Organizations</Title>
                    <Box style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, 360px)",
                        maxWidth: "100%"
                    }}>{
                        orgsArch && orgsArch.map((org) => {
                            return (
                                <BoardListCard
                                    key={org.id}
                                    title={org.name}
                                    bgColor="#4b598c"
                                    bgImage={org.logoUrl}
                                    color="white"
                                    onClick={()=>{
                                        navigate("/org/"+org.id);
                                    }}
                                />
                            )
                        })
                    }</Box>
                    <Title c='white' order={4}>Archived Projects</Title>
                    <Box style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, 360px)",
                        maxWidth: "100%"
                    }}>{
                        projectsArch && projectsArch.map((project) => {
                            return (
                                <BoardListCard
                                    key={project.id}
                                    title={project.name}
                                    bgColor="#4b598c"
                                    bgImage={project.logoUrl}
                                    color="white"
                                    onClick={()=>{
                                        navigate("/project/"+project.id);
                                    }}
                                />
                            )
                        })
                    }</Box>
                    <Title c='white' order={4}>Invites</Title>
                    <Box style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, 360px)",
                        maxWidth: "100%"
                    }}>{
                        sockCtx.userDash && sockCtx.userDash.invites.map((invite) => {
                            return (
                                <Paper
                                    key={invite.id}
                                >
                                    <Title>Invite to {invite.entityId}</Title>
                                </Paper>
                            )
                        })
                    }</Box>
                    {
                        (!sockCtx.userDash) && 
                        <Center w="100%" h="100%">
                            <Loader type="bars"/>
                        </Center>
                    }
                </Box>
                {
                        sockCtx.userDash &&
                        <Center display="block" w="100%">
                            <Text c="#fff" ta="center">
                                <Button
                                    variant="outline"
                                    onClick={()=>{
                                        modals.openContextModal({
                                            modal: 'organization',
                                            title: 'Create New Organization',
                                            innerProps: {},
                                        })
                                    }}
                                    mx="4"
                                    px="8"
                                >
                                    Create your own Organization
                                </Button>
                                or send your username
                                <Tooltip label={"Copy"}>
                                    <Button
                                        variant="subtle" 
                                        onClick={()=>{
                                            clipboard.copy(usr.userData?.username ?? "");
                                        }}
                                        mx="4"
                                        px="4"
                                    >
                                        <Kbd>{clipboard.copied ? "Copied!" : usr.userData?.username}</Kbd>
                                    </Button>
                                </Tooltip>
                                to someone to get invited to one!
                            </Text>
                        </Center>
                    }
            </Box>
        </ScrollArea>
    )
}

export default HomePage;