import React, { useEffect, useState } from "react";
import { Box, Avatar, Group, Flex, Title, Text, Tabs, ScrollArea, Center, Loader, Stack, TextInput, Textarea, ButtonGroup, Button, Divider, Space} from "@mantine/core";
import {BoardListCard} from "@trz/components/BoardListCards";
import {AvatarRow} from "@trz/components/AvatarRow";
import {Organization, OrganizationHeader, OrganizationId, User, UserHeader, UserId} from "@mosaiq/terrazzo-common/types";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "@trz/contexts/socket-context";
import { NoteType, notify } from "@trz/util/notifications";
import {modals} from "@mantine/modals";
import {NotFound} from "@trz/components/NotFound";
import {MembershipRow} from "@trz/components/MembershipRow";
import { EntityType, Role } from "@mosaiq/terrazzo-common/constants";
import {AddUser} from "@trz/components/AddUser";
import {PendingInviteRow} from "@trz/components/PendingInviteRow";
import { DEFAULT_AUTHED_ROUTE } from "@trz/contexts/user-context";
import { MdOutlineMailOutline, MdOutlinePerson, MdOutlineVerifiedUser } from "react-icons/md";
import { useTRZ } from "@trz/contexts/TRZ-context";

const OrganizationPage = (): React.JSX.Element => {
    const [orgData, setOrgData] = useState<Organization | undefined>();
    const [editedSettings, setEditedSettings] = useState<Partial<OrganizationHeader>>({});
    const params = useParams();
	const sockCtx = useSocket();
    const trz = useTRZ();
	const navigate = useNavigate();
    const orgId = params.orgId as OrganizationId | undefined;
    const tabId = params.tabId;
    const myPermissionLevel = Role.OWNER;

	useEffect(() => {
        let strictIgnore = false;
		const fetchOrgData = async () => {
            await new Promise((resolve)=>setTimeout(resolve, 0));
            if(strictIgnore){
                return;
            }
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
        return ()=>{
            strictIgnore = true;
        }
	}, [orgId, sockCtx.connected]);

    if(!orgData || !orgId){
        return <NotFound itemType="Organization"/>
    }

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
                                    bgImage={project.logoUrl}
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
                                const invite = await sockCtx.sendInvite(username, orgId, EntityType.ORG, role);
                                if(invite && orgData){
                                    setOrgData({
                                        ...orgData,
                                        invites: [...orgData.invites, invite]
                                    });
                                }
                                return !!invite;
                            } catch (e) {
                                notify(NoteType.GENERIC_ERROR, e);
                                return false;
                            }
                        }}
                    />
                </Group>
                <Tabs orientation="vertical" defaultValue="members"
                    style={{
                        width: "100%",
                    }}
                >
                    <Tabs.List style={{
                        width:"10rem",
                        color:"white",
                        gap: "lg"
                    }}>
                        <Tabs.Tab value="members" leftSection={<MdOutlinePerson size={18} />}>Members ({orgData.members.length})</Tabs.Tab>
                        <Tabs.Tab value="invites" leftSection={<MdOutlineMailOutline size={18} />}>Invites ({orgData.invites.length})</Tabs.Tab>
                    </Tabs.List>
                    <Tabs.Panel value="members">
                        <Stack
                            px={"md"}
                            style={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                            }}
                        >
                            <Title order={4} c="#fff">Members</Title>
                            {
                                orgData.members.map((m)=>(
                                    <MembershipRow
                                        key={m.user.id}
                                        user={m.user}
                                        record={m.record}
                                        editorPermLevel={myPermissionLevel}
                                        onEditRole={(recordId, role)=>{
                                            if(myPermissionLevel >= Role.ADMIN){
                                                sockCtx.updateMembershipRecordField(recordId, {userRole: role});
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
                    </Tabs.Panel>
                    <Tabs.Panel value="invites">
                        <Stack
                            px={"md"}
                            style={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                            }}
                        >
                            <Title order={4} c="#fff">Pending Invites</Title>
                            {
                                orgData.invites.map((invite)=>(
                                    <PendingInviteRow
                                        key={invite.id}
                                        invite={invite}
                                        editorPermLevel={myPermissionLevel}
                                        onRevokeInvite={()=>{
                                            if(myPermissionLevel >= Role.ADMIN){
                                                sockCtx.replyInvite(invite.id, false);
                                                setOrgData({...orgData, invites:orgData.invites.filter(i=>i.id!==invite.id)});
                                                notify(NoteType.INVITE_REVOKED, [invite.toUser.username])
                                            } else {
                                                notify(NoteType.UNAUTHORIZED);
                                            }
                                        }}
                                    />
                                ))
                            }
                        </Stack>
                    </Tabs.Panel>
                </Tabs>
                
                
                
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
                                setEditedSettings({...editedSettings, name: e.target.value});
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
                                setEditedSettings({...editedSettings, description: e.target.value});
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
                                setEditedSettings({...editedSettings, logoUrl: e.target.value});
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
                                        sockCtx.syncUserDash();
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
                        <Divider/>
                        <Space/>
                        <Button 
                            variant="light"
                            color="red"
                            w="min-content"
                            disabled={myPermissionLevel < Role.OWNER}
                            onClick={async ()=>{
                                if(myPermissionLevel < Role.OWNER){
                                    notify(NoteType.UNAUTHORIZED);
                                    return;
                                }
                                try {
                                    sockCtx.updateOrgField(orgId, {archived: true});
                                    setOrgData({...orgData, archived: true})
                                    notify(NoteType.CHANGES_SAVED);
                                    navigate(DEFAULT_AUTHED_ROUTE);
                                } catch (e) {
                                    notify(NoteType.ORG_DATA_ERROR, e);
                                }

                            }}
                        >
                            Archive Organization
                        </Button>
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
        <ScrollArea h={`calc(100vh - ${trz.navbarHeight}px)`}>
            <Stack bg='#15161A' mih='100vh' pb='10vh' align="center">
                <Box py='25' w='80%'>
                    <Group gap='xl' pl='50'>
                        <Avatar
                            src={orgData.logoUrl ?? undefined}
                            name={orgData.name}
                            color={'initials'}
                            size={"75"}
                            radius={'lg'}
                        />
                        <Flex direction='column'>
                            <Title c='white'>{orgData.name}</Title>
                            {orgData.description && <Text c='#6C6C6C'>{orgData.description}</Text>}
                        </Flex>
                    </Group>
                    <Tabs value={getTab()} pt='30' onChange={onChangeTab} color='#F2187E' variant="default">
                        <Tabs.List>
                            {
                                Object.keys(tabs).map((t)=>{
                                    return (
                                    <Tabs.Tab 
                                        value={t}
                                        
                                        key={t}
                                    >
                                        <Text c='white' fw='bold'>{t}</Text>
                                    </Tabs.Tab>)
                                })
                            }
                            <Flex ml='auto' align='center'>
                                <AvatarRow users={orgData.members.map(m=>m.user)} maxUsers={5}/>
                            </Flex>
                        </Tabs.List>
                    </Tabs>
                </Box>
                {
                    !orgData.archived && tabs[getTab()]
                }
                {
                    orgData.archived && 
                    <Center><Stack>
                        <Title c="#fff" ta="center" order={3}>This Organization is archived</Title>
                        <Button
                            variant="default"
                            disabled={myPermissionLevel < Role.OWNER}
                            onClick={async ()=>{
                                if(myPermissionLevel < Role.OWNER){
                                    notify(NoteType.UNAUTHORIZED);
                                    return;
                                }
                                try {
                                    sockCtx.updateOrgField(orgId, {archived: false});
                                    setOrgData({...orgData, archived: false})
                                    notify(NoteType.CHANGES_SAVED);
                                } catch (e) {
                                    notify(NoteType.ORG_DATA_ERROR, e);
                                }
                            }}
                        >
                            Unarchive Organization
                        </Button>
                    </Stack></Center>
                }
            </Stack>
        </ScrollArea>
    )
}
export default OrganizationPage;