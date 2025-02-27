import React, { useEffect, useState } from "react";
import { Box, Avatar, Group, Flex, Title, Text, Tabs, ScrollArea, Center, Loader, Stack, TextInput, Textarea, ButtonGroup, Button} from "@mantine/core";
import {BoardListCard} from "@trz/components/BoardListCards";
import {AvatarRow} from "@trz/components/AvatarRow";
import {Organization, OrganizationHeader, OrganizationId, User, UserHeader, UserId} from "@mosaiq/terrazzo-common/types";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "@trz/util/socket-context";
import { NoteType, notify } from "@trz/util/notifications";
import {modals} from "@mantine/modals";
import {NotFound} from "@trz/components/NotFound";
import {MembershipRow} from "@trz/components/MembershipRow";
import { EntityType, Role } from "@mosaiq/terrazzo-common/constants";
import {AddUser} from "@trz/components/AddUser";
import {PendingInviteRow} from "@trz/components/PendingInviteRow";

const OrganizationPage = (): React.JSX.Element => {
    const [orgData, setOrgData] = useState<Organization | undefined>();
    const [editedSettings, setEditedSettings] = useState<Partial<OrganizationHeader>>({});
    const params = useParams();
	const sockCtx = useSocket();
	const navigate = useNavigate();
    const orgId = params.orgId as OrganizationId | undefined;
    const tabId = params.tabId;
    const myPermissionLevel = Role.ADMIN;

	useEffect(() => {
		const fetchOrgData = async () => {
			if (!orgId) {
				return;
			}
            try{
                const data = await sockCtx.getOrganizationData(orgId as OrganizationId)
                setOrgData(data);
                setEditedSettings(data ?? {});
            } catch(err) {
                notify(NoteType.ORG_DATA_ERROR, err);
                navigate("/dashboard");
                return;
			}
		};
		fetchOrgData();
	}, [orgId, sockCtx.connected]);

    if(!orgData || !orgId){
        return <NotFound itemType="Organization"/>
    }

    // const testUsers:UserHeader[] = Array.from({ length: 5 }).map(() => (
    //     {
    //         id:crypto.randomUUID(),
    //         githubUserId:"",
    //         firstName:"Matt",
    //         lastName:"Hagger",
    //         username:"Camo651",
    //         profilePicture:"https://avatars.githubusercontent.com/u/47070087?v=4"
    //     }
    // ))

    const tabs = {
        "Projects": (
            <Box style={{
                width: "80%",
                display: "flex",
                flexDirection: 'column',
                flexWrap: 'nowrap',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
            }}>
                <Title c='white' pb='20' order={2} maw='200'>Projects</Title>
                {/* 
                //TODO implement project sorting
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
                            orgData.projects.map((project) => (
                                <BoardListCard 
                                    key={project.id}
                                    bgColor={'#121314'}
                                    color="white"
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
                        <BoardListCard 
                            centered
                            title="+ Add Project"
                            bgColor={'#121314'}
                            color="white"
                            onClick={() =>
                                modals.openContextModal({
                                    modal: 'project',
                                    title: 'Create Project',
                                    innerProps: {orgId: orgData.id},
                                })
                            }
                        />
                    </Box>
                </Box>
            </Box>
        ),
        "Members": (
            <Box style={{
                width: "80%",
                display: "flex",
                flexDirection: 'column',
                flexWrap: 'nowrap',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
            }}>
                <Group w="100%" justify="space-between">
                    <Title c='white' pb='20' order={2} maw='200'>Members</Title>
                    <AddUser
                        disabled={myPermissionLevel < Role.ADMIN}
                        onSubmit={async (username:string, role:Role)=>{
                            try {
                                return await sockCtx.sendInvite(username, orgId, EntityType.ORG, role);
                            } catch (e) {
                                notify(NoteType.GENERIC_ERROR, e);
                                return false;
                            }
                        }}
                    />
                </Group>
                <Stack style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                }}>
                    {
                        orgData.members.map((m)=>(
                            <MembershipRow
                                key={m.user.id}
                                user={m.user}
                                record={m.record}
                                editorPermLevel={myPermissionLevel}
                                onEditRole={(recordId, role)=>{
                                    if(myPermissionLevel >= Role.ADMIN){
                                        sockCtx.updateMembershipRecordField(recordId, {role: role});
                                    } else {
                                        notify(NoteType.UNAUTHORIZED);
                                    }
                                }}
                                onRemoveMember={()=>{
                                    if(myPermissionLevel >= Role.ADMIN){
                                        sockCtx.kickMemberFromEntity(m.record.id);
                                    } else {
                                        notify(NoteType.UNAUTHORIZED);
                                    }
                                }}
                            />
                        ))
                    }
                </Stack>
                <Title order={4} c="#fff">Pending Invites</Title>
                <Stack style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                }}>
                    {
                        orgData.invites.map((invite)=>(
                            <PendingInviteRow
                                key={invite.id}
                                invite={invite}
                                editorPermLevel={myPermissionLevel}
                                onRevokeInvite={()=>{
                                    if(myPermissionLevel >= Role.ADMIN){
                                        sockCtx.replyInvite(invite.id, false);
                                    } else {
                                        notify(NoteType.UNAUTHORIZED);
                                    }
                                }}
                            />
                        ))
                    }
                </Stack>
                
            </Box>
        ),
        "Settings": (
            <Box style={{
                width: "80%",
                display: "flex",
                flexDirection: 'column',
                flexWrap: 'nowrap',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
            }}>
                <Title c='white' pb='20' order={2} maw='200'>Settings</Title>
                <Box style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center"
                }}>
                    <Stack style={{
                        width: "40rem"
                    }}>
                        <TextInput
                            labelProps={{
                                c:"white"
                            }}
                            label="Organization Name"
                            placeholder="My Organization"
                            value={editedSettings.name ?? ''}
                            onChange={(e)=>{
                                setEditedSettings({...editedSettings, name: e.target.value})
                            }}
                            disabled={myPermissionLevel < Role.ADMIN}
                        />
                        <Textarea
                            labelProps={{
                                c:"white"
                            }}
                            label="Organization Description"
                            placeholder="Write some info about your organization"
                            value={editedSettings.description ?? ''}
                            onChange={(e)=>{
                                setEditedSettings({...editedSettings, description: e.target.value})
                            }}
                            disabled={myPermissionLevel < Role.ADMIN}
                        />
                        <TextInput
                            labelProps={{
                                c:"white"
                            }}
                            label="Organization Logo URL"
                            placeholder="https://mosaiq.dev/logo.png"
                            value={editedSettings.logoUrl ?? ''}
                            onChange={(e)=>{
                                setEditedSettings({...editedSettings, logoUrl: e.target.value})
                            }}
                            disabled={myPermissionLevel < Role.ADMIN}
                        />
                        <Group>
                            <Button 
                                variant="outline"
                                disabled={myPermissionLevel < Role.ADMIN}
                                onClick={()=>{
                                    setEditedSettings(orgData ?? {});
                                }}
                            >
                                Cancel
                            </Button>
                            <Button 
                                variant="filled"
                                disabled={myPermissionLevel < Role.ADMIN}
                                onClick={async ()=>{
                                    if(myPermissionLevel < Role.ADMIN){
                                        notify(NoteType.UNAUTHORIZED);
                                        return;
                                    }
                                    try {
                                        sockCtx.updateOrgField(orgId, editedSettings);
                                        console.log("A'")
                                        setOrgData({...orgData, ...editedSettings})
                                        notify(NoteType.CHANGES_SAVED);
                                    } catch (e) {
                                        notify(NoteType.ORG_DATA_ERROR, e);
                                    }

                                }}
                            >
                                Save
                            </Button>
                        </Group>
                    </Stack>
                </Box>
            </Box>
        )
    };
    
    const onChangeTab = (tab: string|null) => {
        if(tab === Object.keys(tabs)[0])
            tab = '';
        navigate(`/org/${orgId}/${tab}`)
    }
    const getTab = () => {
        return (tabId && tabId in tabs) ? tabId : Object.keys(tabs)[0];
    }

    return (
        <ScrollArea h='100vh'>
            <Stack bg='#15161A' mih='100vh' pb='10vh' align="center">
                <Box py='25' w='80%'>
                    <Group gap='xl' pl='50'>
                        <Avatar size='75' radius='lg' src={orgData.logoUrl}/>
                        <Flex direction='column'>
                            <Title c='white'>{orgData.name}</Title>
                            {orgData.description && <Text c='#6C6C6C'>{orgData.description}</Text>}
                        </Flex>
                    </Group>
                    <Tabs value={getTab()} pt='30' onChange={onChangeTab}>
                        <Tabs.List>
                            {
                                Object.keys(tabs).map((t)=>{
                                    return (<Tabs.Tab value={t} color='#F2187E' key={t}><Text c='white' fw='bold'>{t}</Text></Tabs.Tab>)
                                })
                            }
                            <Flex ml='auto' align='center'>
                                <AvatarRow users={orgData.members.map(m=>m.user)} maxUsers={5}/>
                            </Flex>
                        </Tabs.List>
                    </Tabs>
                </Box>
                {
                    tabs[getTab()]
                }
            </Stack>
        </ScrollArea>
    )
}
export default OrganizationPage;