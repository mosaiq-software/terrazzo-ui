import React, { useEffect, useState } from "react";
import {Box, Group, ScrollArea, Title, Flex, Divider, Select, Button, Text, Loader, Center} from "@mantine/core";
import { BoardListCard} from "@trz/components/BoardListCards";
import { OrganizationHeader, ProjectHeader, UserId} from "@mosaiq/terrazzo-common/types";
import { useNavigate } from "react-router-dom";
import { useSocket } from "@trz/util/socket-context";
import { NoteType, notify } from "@trz/util/notifications";


const HomePage = (): React.JSX.Element => {
    const [usersEntities, setUsersEntities] = useState<{organizations: OrganizationHeader[], projects: ProjectHeader[] } | undefined>();
	const sockCtx = useSocket();
	const navigate = useNavigate();

	useEffect(() => {
		const fetchOrgData = async () => {
            try{
                const userId:UserId = "placeholder-7f7e-4b13-8554-e0c3d5daac6c";
                const data = await sockCtx.getMyOrganizations(userId);
                setUsersEntities(data);
            } catch(err) {
                console.error(err);
                notify(NoteType.ORG_DATA_ERROR);
                return;
			}
		};
		fetchOrgData();
	}, [sockCtx.connected]);

    return (
        <ScrollArea bg='#15161A' h='100vh'>
            <Box  w='100vw' pl='1vw' mih='100vh' pb='10vh'>
                <Flex justify='space-between' py='25'>
                    <Title c='white' order={2}>Your Organizations</Title>
                    <Group pr='70'>
                        <Select 
                            data={['All Views', 'Workspace views?', 'Mosaiq']}
                            defaultValue='All Views'
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
                        <Button size='compact-md' color='#27292E' fw='500'>Recent</Button>
                        <Button size='compact-md' color='#27292E' fw='500'>Newest</Button>
                        <Button size='compact-md' color='#27292E' fw='500'>Oldest</Button>
                        <Divider orientation='vertical' color='#868e96'/>
                        <Button size='compact-md' color='#27292E' fw='500'>Grid</Button>
                        <Button size='compact-md' color='#27292E' fw='500'>List</Button>
                    </Group>
                </Flex>
                <Divider maw='98%' color='#5B5857' mb='15'/>
                {
                    usersEntities && usersEntities.organizations.map((org) => {
                        return (
                            <BoardListCard
                                key={org.id}
                                title={org.name}
                                color="#3ac9a2"
                                onClick={()=>{
                                    navigate("/org/"+org.id);
                                }}
                            />
                        )
                    })
                }
                {
                    (!usersEntities) && 
                    <Center w="100%" h="100%">
                        <Loader type="bars"/>
                    </Center>
                }
            </Box>
        </ScrollArea>
    )
}

export default HomePage;