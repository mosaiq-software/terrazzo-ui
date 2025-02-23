import React, { useEffect, useState } from "react";
import { Box, Avatar, Group, Flex, Title, Text, Tabs, Select, Divider, Button, ScrollArea, Center, Loader} from "@mantine/core";
import {AddBoardListCard, BoardListCard} from "@trz/components/BoardListCards";
import {AvatarRow} from "@trz/components/AvatarRow";
import {Organization, OrganizationId} from "@mosaiq/terrazzo-common/types";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "@trz/util/socket-context";
import { NoteType, notify } from "@trz/util/notifications";
import {modals} from "@mantine/modals";

const OrganizationPage = (): React.JSX.Element => {
    const [orgData, setOrgData] = useState<Organization | undefined>();
    const params = useParams();
	const sockCtx = useSocket();
	const navigate = useNavigate();

	useEffect(() => {
		const fetchOrgData = async () => {
			if (!params.orgId) {
				return;
			}
            try{
                const data = await sockCtx.getOrganizationData(params.orgId as OrganizationId)
                setOrgData(data);
            } catch(err) {
                console.error(err);
                navigate("/dashboard");
                notify(NoteType.ORG_DATA_ERROR);
                return;
			}
		};
		fetchOrgData();
	}, [params.orgId, sockCtx.connected]);


    const testUsers = Array.from({ length: 5 }).map(() => ({
        name: "John Doe",
        url: "https://avatars.githubusercontent.com/u/47070087?v=4"
    }))

    if(!orgData){
        return <p>Organization not found</p>
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
                            <Title c='white'>{orgData.name}</Title>
                            <Text c='#6C6C6C'>The Description of Organization</Text>
                        </Flex>
                    </Group>
                    <Tabs defaultValue='Boards' pt='30' onChange={(e)=>console.log(e)}>
                        <Tabs.List>
                            <Tabs.Tab value='Projects' color='#F2187E'><Text c='white' fw='bold'>Projects</Text></Tabs.Tab>
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
                        <Title c='white' pb='20' order={2} maw='200'>Projects</Title>
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
                                orgData.projects.map((project) => (
                                    <BoardListCard 
                                        key={project.id}
                                        color={'#121314'}
                                        title={project.name}
                                        onClick={()=>{
                                            navigate("/project/"+project.id);
                                        }}
                                    />
                                ))
                            }
                            {
                                (!orgData) && 
                                <Center w="100%" h="100%">
                                    <Loader type="bars"/>
                                </Center>
                            }
                            <AddBoardListCard 
                                title="+ Add Project"
                                onClick={() =>
                                    modals.openContextModal({
                                        modal: 'project',
                                        title: 'Create Project',
                                        innerProps: {orgId: orgData.id},
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
export default OrganizationPage;