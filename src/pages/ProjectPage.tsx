import React, { useEffect, useState } from "react";
import { Box, Avatar, Group, Flex, Title, Text, Tabs, Select, Divider, Button, ScrollArea, Center, Loader, Stack} from "@mantine/core";
import {BoardListCard} from "@trz/components/BoardListCards";
import {AvatarRow} from "@trz/components/AvatarRow";
import {Project, ProjectId, UserHeader, UserId} from "@mosaiq/terrazzo-common/types";
import { modals } from "@mantine/modals";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "@trz/util/socket-context";
import { NoteType, notify } from "@trz/util/notifications";
import { NotFound } from "@trz/components/NotFound";

const ProjectPage = (): React.JSX.Element => {
    const [project, setProject] = useState<Project | undefined>();
    const params = useParams();
	const sockCtx = useSocket();
	const navigate = useNavigate();

	useEffect(() => {
		const fetchOrgData = async () => {
			if (!params.projectId) {
				return;
			}
            try{
                const data = await sockCtx.getProjectData(params.projectId as ProjectId);
                setProject(data);
            } catch(err) {
                notify(NoteType.PROJECT_DATA_ERROR, err);
                navigate("/dashboard");
                return;
			}
		};
		fetchOrgData();
	}, [params.projectId, sockCtx.connected]);

    const testUsers:UserHeader[] = Array.from({ length: 5 }).map(() => ({
        id: `h-h-h-h-h`,
        username: "johndoe",
        firstName: "John",
        lastName: "Doe",
        profilePicture: "https://avatars.githubusercontent.com/u/47070087?v=4",
        githubUserId: "",
    }))

    if(!project){
        return <NotFound itemType="Project"/>
    }

    return (
        <ScrollArea h='100vh'>
            <Stack bg='#15161A' mih='100vh' pb='10vh' align="center">
                <Box py='25' w='80%'>
                    <Group gap='xl' pl='50'>
                        <Avatar size='75' radius='lg' src={project.logoUrl}/>
                        <Flex direction='column'>
                            <Title c='white'>{project.name}</Title>
                            <Text c='#6C6C6C'>The Description of Project</Text>
                        </Flex>
                    </Group>
                    <Tabs defaultValue='Boards' pt='30' onChange={(e)=>console.log(e)}>
                        <Tabs.List>
                            <Tabs.Tab value='Boards' color='#F2187E'><Text c='white' fw='bold'>Boards</Text></Tabs.Tab>
                            <Tabs.Tab value='Members' color='#F2187E'><Text c='white' fw='bold'>Members</Text></Tabs.Tab>
                            <Tabs.Tab value='Settings' color='#F2187E'><Text c='white' fw='bold'>Settings</Text></Tabs.Tab>
                            <Flex ml='auto' align='center'>
                                <AvatarRow users={testUsers} maxUsers={5}/>
                            </Flex>
                        </Tabs.List>
                    </Tabs>
                </Box>
                <Box style={{
                    width: "80%",
                    display: "flex",
                    flexDirection: 'column',
                    flexWrap: 'nowrap',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                }}>
                    <Title c='white' pb='20' order={2} maw='200'>Boards</Title>
                    {/* 
                    // TODO implement board sorting
                    <Group maw='40%'>
                        <Select data={['Sort by: Alphabetical A-Z', 'Date', 'Creator']}
                                defaultValue='Sort by: Alphabetical A-Z'
                                size='xs'
                                styles={{
                                    input: {
                                        backgroundColor: '#27292E',
                                        color: 'white',
                                        borderColor: '#1d2022',
                                    },
                                    dropdown: {
                                        backgroundColor: '#27292E',
                                        color: 'white',
                                    },
                                    option: {
                                        backgroundColor: '#27292E',
                                        color: 'white',
                                    }
                                }}
                        />
                        <Divider orientation='vertical' color='#868e96'/>
                        <Button size='compact-sm' color='#27292E' fw='500'>Grid</Button>
                        <Button size='compact-sm' color='#27292E' fw='500'>List</Button>
                    </Group> */}
                    <Box style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center"
                    }}>
                        <Box style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, 360px)",
                            maxWidth: "100%"
                        }}>
                            {
                                project.boards.map((board) => (
                                    <BoardListCard 
                                        key={board.id}
                                        title={board.name}
                                        bgColor={'#121314'}
                                        color="white"
                                        onClick={()=>{
                                            navigate("/board/"+board.id);
                                        }}
                                    />
                                ))
                            }
                            {
                                (!project) && 
                                <Center w="100%" h="100%">
                                    <Loader type="bars"/>
                                </Center>
                            }
                            <BoardListCard
                                centered
                                title="+ Add Board"
                                bgColor={'#121314'}
                                color="white"
                                onClick={() =>
                                    modals.openContextModal({
                                        modal: 'board',
                                        title: 'Create Board',
                                        innerProps: {projectId: project.id},
                                    })
                                }
                            />
                        </Box>
                    </Box>
                </Box>
            </Stack>
        </ScrollArea>
    )
}
export default ProjectPage;