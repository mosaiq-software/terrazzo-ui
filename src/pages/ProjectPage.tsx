import React, { useEffect} from "react";
import { Box, Avatar, Group, Flex, Title, Text, Tabs, ScrollArea, Center, Stack, Button} from "@mantine/core";
import {AvatarRow} from "@trz/components/AvatarRow";
import {OrganizationId, ProjectId, UserHeader} from "@mosaiq/terrazzo-common/types";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "@trz/contexts/socket-context";
import { NoteType, notify } from "@trz/util/notifications";
import {NotFound, PageErrors} from "@trz/components/NotFound";
import {Role } from "@mosaiq/terrazzo-common/constants";
import { useTRZ } from "@trz/contexts/TRZ-context";
import { getRoomCode } from "@mosaiq/terrazzo-common/utils/socketUtils";
import { RoomType } from "@mosaiq/terrazzo-common/socketTypes";
import {ProjectTabCards} from "@trz/components/ProjectTabs/ProjectTabCards";
import {ProjectTabSettings} from "@trz/components/ProjectTabs/ProjectTabSettings";
import {ProjectTabMembers} from "@trz/components/ProjectTabs/ProjectTabMembers";

const ProjectPage = (): React.JSX.Element => {
    const params = useParams();
	const sockCtx = useSocket();
    const trz = useTRZ();
	const navigate = useNavigate();
    const projectId = params.projectId as ProjectId | undefined;
    const tabId = params.tabId;

	useEffect(() => {
        let strictIgnore = false;
		const fetchProjectData = async () => {
            await new Promise((resolve)=>setTimeout(resolve, 0));
            if(strictIgnore || !projectId || !sockCtx.connected){
                return;
            }

            try{
                await sockCtx.getProjectData(projectId);
            } catch(err) {
                notify(NoteType.PROJECT_DATA_ERROR, err);
                navigate("/dashboard");
                return;
			}

            try {
                if (!sockCtx.connected) { return; }
                sockCtx.setRoom(getRoomCode(RoomType.DATA, projectId));
            } catch (e) {
                notify(NoteType.SOCKET_ROOM_ERROR, [getRoomCode(RoomType.DATA, projectId)]);
            }
		};
		fetchProjectData();
        return ()=>{
            strictIgnore = true;
            sockCtx.setRoom(null);
        }
	}, [projectId, sockCtx.connected]);

    if(!sockCtx.projectData || !projectId){
        return <NotFound itemType="Project" error={PageErrors.NOT_FOUND}/>
    }

    const orgId = sockCtx.projectData.orgId;
    let myMembershipRecord = sockCtx.userDash?.organizations.find(o=>o.id===orgId)?.myMembershipRecord;
    const projectMembershipRecord = sockCtx.userDash?.standaloneProjects.find(p=>p.id===projectId)?.myMembershipRecord;
    if((!myMembershipRecord) || (myMembershipRecord && projectMembershipRecord && projectMembershipRecord.userRole > myMembershipRecord.userRole)){
        myMembershipRecord = projectMembershipRecord;
    }


    if(!myMembershipRecord){
        return <NotFound itemType="Project" error={PageErrors.FORBIDDEN}/>
    }


    const tabs = {
        "Boards": <ProjectTabCards/>,
        "Members": <ProjectTabMembers myMembershipRecord={myMembershipRecord} projectId={projectId} />,
        "Settings": <ProjectTabSettings myMembershipRecord={myMembershipRecord} projectId={projectId}/>,
    }
    
    const onChangeTab = (tab: string|null) => {
        if(tab === Object.keys(tabs)[0])
            tab = '';
        navigate(`/project/${projectId}/${tab}`)
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
                            src={sockCtx.projectData.logoUrl ?? undefined}
                            name={sockCtx.projectData.name}
                            color={'initials'}
                            size={"75"}
                            radius={'lg'}
                        />
                        <Flex direction='column'>
                            <Title c='white'>{sockCtx.projectData.name}</Title>
                            <Text c='#6C6C6C'>{sockCtx.projectData.description}</Text>
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
                                <AvatarRow users={sockCtx.projectData.externalMembers.map(m=>m.user)} maxUsers={5}/>
                            </Flex>
                        </Tabs.List>
                    </Tabs>
                </Box>
                {
                    !sockCtx.projectData.archived && tabs[getTab()]
                }
                {
                    sockCtx.projectData.archived && 
                    <Center><Stack>
                        <Title c="#fff" ta="center" order={3}>This Project is archived</Title>
                        <Button
                            variant="default"
                            disabled={myMembershipRecord.userRole < Role.OWNER}
                            onClick={async ()=>{
                                if(myMembershipRecord.userRole < Role.OWNER){
                                    notify(NoteType.UNAUTHORIZED);
                                    return;
                                }
                                try {
                                    sockCtx.updateProjectField(projectId, {archived: false});
                                    notify(NoteType.CHANGES_SAVED);
                                } catch (e) {
                                    notify(NoteType.PROJECT_DATA_ERROR, e);
                                }
                            }}
                        >
                            Unarchive Project
                        </Button>
                    </Stack></Center>
                }
            </Stack>
        </ScrollArea>
    )
}
export default ProjectPage;