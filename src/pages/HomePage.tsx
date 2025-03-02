import React, { useEffect, useState } from "react";
import {Box, ScrollArea, Title, Flex, Divider, Text, Loader, Center, Paper, Kbd, UnstyledButton, Button, Tooltip, Affix} from "@mantine/core";
import { BoardListCard} from "@trz/components/BoardListCards";
import { UserDash} from "@mosaiq/terrazzo-common/types";
import { useNavigate } from "react-router-dom";
import { useSocket } from "@trz/contexts/socket-context";
import { NoteType, notify } from "@trz/util/notifications";
import { useUser } from "@trz/contexts/user-context";
import { useClipboard } from "@mantine/hooks";
import { modals } from "@mantine/modals";


const HomePage = (): React.JSX.Element => {
    const [dash, setDash] = useState<UserDash | undefined>();
	const sockCtx = useSocket();
    const usr = useUser();
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
                const data = await sockCtx.getUsersDash(usr.userData.id);
                setDash(data);
            } catch(err) {
                notify(NoteType.DASH_ERROR, err);
                return;
			}
		};
		fetchOrgData();
        return ()=>{
            strictIgnore = true;
        }
	}, [sockCtx.connected, usr.userData]);

    return (
        <ScrollArea bg='#15161A' h='100vh'  w='100vw'>
            <Center>
                <Box mih='100vh' py='2rem' maw="1200px" miw="90%">
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
                            dash && dash.organizations.filter((e)=>!e.archived).map((org) => {
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
                            dash && dash.projects.filter((e)=>!e.archived).map((project) => {
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
                            dash && dash.organizations.filter((e)=>e.archived).map((org) => {
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
                            dash && dash.projects.filter((e)=>e.archived).map((project) => {
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
                            dash && dash.invites.map((invite) => {
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
                            (!dash) && 
                            <Center w="100%" h="100%">
                                <Loader type="bars"/>
                            </Center>
                        }
                    </Box>
                    {
                            dash &&
                            <Affix position={{bottom:20}} w="100vw">
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
                                        px="4"
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
                            </Affix>
                        }
                </Box>
            </Center>
        </ScrollArea>
    )
}

export default HomePage;