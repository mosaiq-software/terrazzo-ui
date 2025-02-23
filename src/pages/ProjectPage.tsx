import React, { useEffect, useState } from "react";
import { Box, Avatar, Group, Flex, Title, Text, Tabs, Select, Divider, Button, ScrollArea, Center, Loader} from "@mantine/core";
import {AddBoardListCard, BoardListCard} from "../components/BoardListCards";
import {AvatarRow} from "@trz/components/AvatarRow";
import {Project, ProjectId} from "@mosaiq/terrazzo-common/types";
import { modals } from "@mantine/modals";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "@trz/util/socket-context";
import { NoteType, notify } from "@trz/util/notifications";

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
                const data = await sockCtx.getProjectData(params.projectId as ProjectId)
                setProject(data);
            } catch(err) {
                console.error(err);
                navigate("/dashboard");
                notify(NoteType.PROJECT_DATA_ERROR);
                return;
			}
		};
		fetchOrgData();
	}, [params.projectId, sockCtx.connected]);

    const testUsers = Array.from({ length: 5 }).map(() => ({
        name: "John Doe",
        url: "https://avatars.githubusercontent.com/u/47070087?v=4"
    }))

    if(!project){
        return <p>Project not found</p>
    }

    return (
        <ScrollArea h='100vh'>
            <Box bg='#15161A' mih='100vh' pb='10vh'>
                <Box p='25'>
                    <Group gap='xl'
                        pl='50'>
                        <Avatar size='75'
                                radius='lg'/>
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
                            <Flex ml='auto'
                                align='center'>
                                <AvatarRow users={testUsers} maxUsers={5}/>
                            </Flex>
                        </Tabs.List>
                    </Tabs>
                </Box>
                <Center>
                    <Box>
                        <Title c='white' pb='20' order={2} maw='200'>Boards</Title>
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
                        </Group>
                        <Group justify='center' align='center' wrap='wrap' gap='1' w='fit-content' maw={380*4}>
                            {
                                project.boards.map((board) => (
                                    <BoardListCard 
                                        key={board.id}
                                        title={board.name}
                                        color={'#121314'}
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
                            <AddBoardListCard 
                                title="+ Add Board"
                                onClick={() =>
                                    modals.openContextModal({
                                        modal: 'board',
                                        title: 'Create Board',
                                        innerProps: {projectId: project.id},
                                    })
                                }
                            />
                        </Group>
                    </Box>
                </Center>
            </Box>
        </ScrollArea>
    )
}
export default ProjectPage;