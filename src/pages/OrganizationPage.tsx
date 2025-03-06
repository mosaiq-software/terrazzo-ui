import React, { useEffect} from "react";
import { Box, Avatar, Group, Flex, Title, Text, Tabs, ScrollArea, Center, Stack, Button} from "@mantine/core";
import {AvatarRow} from "@trz/components/AvatarRow";
import {OrganizationId, UserHeader} from "@mosaiq/terrazzo-common/types";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "@trz/contexts/socket-context";
import { NoteType, notify } from "@trz/util/notifications";
import {NotFound, PageErrors} from "@trz/components/NotFound";
import {Role } from "@mosaiq/terrazzo-common/constants";
import { useTRZ } from "@trz/contexts/TRZ-context";
import { getRoomCode } from "@mosaiq/terrazzo-common/utils/socketUtils";
import { RoomType } from "@mosaiq/terrazzo-common/socketTypes";
import {OrgTabCards} from "@trz/components/OrganizationTabs/OrgTabCards";
import {OrgTabSettings} from "@trz/components/OrganizationTabs/OrgTabSettings";
import {OrgTabMembers} from "@trz/components/OrganizationTabs/OrgTabMembers";

const OrganizationPage = (): React.JSX.Element => {
    const params = useParams();
	const sockCtx = useSocket();
    const trz = useTRZ();
	const navigate = useNavigate();
    const orgId = params.orgId as OrganizationId | undefined;
    const tabId = params.tabId;
    const myMembershipRecord = sockCtx.userDash?.organizations.find(o=>o.id===orgId)?.myMembershipRecord;

	useEffect(() => {
        let strictIgnore = false;
		const fetchOrgData = async () => {
            await new Promise((resolve)=>setTimeout(resolve, 0));
            if(strictIgnore || !orgId || !sockCtx.connected){
                return;
            }

            try{
                await sockCtx.getOrganizationData(orgId);
            } catch(err) {
                notify(NoteType.ORG_DATA_ERROR, err);
                navigate("/dashboard");
                return;
			}

            try {
                if (!sockCtx.connected) { return; }
                sockCtx.setRoom(getRoomCode(RoomType.DATA, orgId));
                return () => {
                    sockCtx.setRoom(null);
                }
            } catch (e) {
                notify(NoteType.SOCKET_ROOM_ERROR, [getRoomCode(RoomType.DATA, orgId)]);
            }
		};
		fetchOrgData();
        return ()=>{
            strictIgnore = true;
            sockCtx.setRoom(null);
        }
	}, [orgId, sockCtx.connected]);

    if(!sockCtx.orgData || !orgId){
        return <NotFound itemType="Organization" error={PageErrors.NOT_FOUND}/>
    }
    if(!myMembershipRecord){
        return <NotFound itemType="Organization" error={PageErrors.FORBIDDEN}/>
    }

    const tabs: any = {
        "Projects": <OrgTabCards/>,
        "Members": <OrgTabMembers myMembershipRecord={myMembershipRecord} orgId={orgId} />,
        "Settings": <OrgTabSettings myMembershipRecord={myMembershipRecord} orgId={orgId}/>,
    }
    
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
                            src={sockCtx.orgData.logoUrl ?? undefined}
                            name={sockCtx.orgData.name}
                            color={'initials'}
                            size={"75"}
                            radius={'lg'}
                        />
                        <Flex direction='column'>
                            <Title c='white'>{sockCtx.orgData.name}</Title>
                            <Text c='#6C6C6C'>{sockCtx.orgData.description}</Text>
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
                                <AvatarRow users={sockCtx.orgData.members.map(m=>m.user)} maxUsers={5}/>
                            </Flex>
                        </Tabs.List>
                    </Tabs>
                </Box>
                {
                    !sockCtx.orgData.archived && tabs[getTab()]
                }
                {
                    sockCtx.orgData.archived && 
                    <Center><Stack>
                        <Title c="#fff" ta="center" order={3}>This Organization is archived</Title>
                        <Button
                            variant="default"
                            disabled={myMembershipRecord.userRole < Role.OWNER}
                            onClick={async ()=>{
                                if(myMembershipRecord.userRole < Role.OWNER){
                                    notify(NoteType.UNAUTHORIZED);
                                    return;
                                }
                                try {
                                    sockCtx.updateOrgField(orgId, {archived: false});
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