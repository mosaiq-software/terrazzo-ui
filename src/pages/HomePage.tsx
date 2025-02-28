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
                notify(NoteType.ORG_DATA_ERROR, err);
                return;
			}
		};
		fetchOrgData();
	}, [sockCtx.connected]);

    return (
        <ScrollArea bg='#15161A' h='100vh'  w='100vw'>
            <Center>
                <Box mih='100vh' py='2rem' maw="1200px" miw="90%">
                    <Flex justify='space-between' py='25'>
                        <Title c='white' order={2} display={"block"}>Your Organizations</Title>
                        {/* 
                        //TODO implement board sorting
                        <Group>
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
                        </Group> */}
                    </Flex>
                    <Divider color='#5B5857' mb='15'/>
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
                            usersEntities && usersEntities.organizations.map((org) => {
                                return (
                                    <BoardListCard
                                        key={org.id}
                                        title={org.name}
                                        bgColor="#3ac9a2"
                                        color="white"
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
                    </Box>
                    
                </Box>
            </Center>
        </ScrollArea>
    )
}

export default HomePage;