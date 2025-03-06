import React from "react";
import { Box, Group, Title, Tabs, Stack, Divider } from "@mantine/core";
import { Role, EntityType } from "@mosaiq/terrazzo-common/constants";
import { notify, NoteType } from "@trz/util/notifications";
import { MdOutlinePerson, MdOutlineMailOutline } from "react-icons/md";
import { AddUser } from "@trz/components/AddUser";
import { MembershipRow } from "@trz/components/MembershipRow";
import { MembershipRecord, ProjectId } from "@mosaiq/terrazzo-common/types";
import {PendingInviteRow} from "@trz/components/PendingInviteRow";
import { useSocket } from "@trz/contexts/socket-context";

interface ProjectTabMembersProps {
    myMembershipRecord: MembershipRecord;
    projectId: ProjectId;
}
export const ProjectTabMembers = (props: ProjectTabMembersProps) => {
    const sockCtx = useSocket();

    if(!sockCtx.projectData) {
        return null;
    }

    return(
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
                    disabled={props.myMembershipRecord.userRole < Role.ADMIN}
                    onSubmit={async (username:string, role:Role)=>{
                        try {
                            const invite = await sockCtx.sendInvite(username, props.projectId, EntityType.PROJECT, role);
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
                    <Tabs.Tab value="members" leftSection={<MdOutlinePerson size={18} />}>Members ({sockCtx.projectData.externalMembers.length})</Tabs.Tab>
                    <Tabs.Tab value="invites" leftSection={<MdOutlineMailOutline size={18} />}>Invites ({sockCtx.projectData.invites.length})</Tabs.Tab>
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
                        <Title order={4} c="#fff">External Members</Title>
                        {
                            sockCtx.projectData.externalMembers.map((member)=>(
                                <MembershipRow
                                    key={member.user.id}
                                    user={member.user}
                                    record={member.record}
                                    editorsRecord={props.myMembershipRecord}
                                    onEditRole={(recordId, role)=>{
                                        if(props.myMembershipRecord.userRole >= Role.ADMIN && member.record.userRole < Role.OWNER  && props.myMembershipRecord.userId !== member.record.userId){
                                            sockCtx.updateMembershipRecordField(recordId, {userRole: role});
                                        } else {
                                            notify(NoteType.UNAUTHORIZED);
                                        }
                                    }}
                                    onRemoveMember={()=>{
                                        if(props.myMembershipRecord.userRole >= Role.ADMIN && member.record.userRole < Role.OWNER  && props.myMembershipRecord.userId !== member.record.userId){
                                            sockCtx.revokeMembershipRecord(member.record.id);
                                        } else {
                                            notify(NoteType.UNAUTHORIZED);
                                        }
                                    }}
                                />
                            ))
                        }
                        <Divider c="#ddd" />
                        <Title order={4} c="#fff">Organization Members</Title>
                        {
                            sockCtx.projectData.orgMembers.map((member)=>(
                                <MembershipRow
                                    readonly
                                    key={member.user.id}
                                    user={member.user}
                                    record={member.record}
                                    editorsRecord={props.myMembershipRecord}
                                    onEditRole={(recordId, role)=>{}}
                                    onRemoveMember={()=>{}}
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
                            sockCtx.projectData.invites.map((invite)=>(
                                <PendingInviteRow
                                    key={invite.id}
                                    invite={invite}
                                    editorPermLevel={props.myMembershipRecord.userRole}
                                    onRevokeInvite={()=>{
                                        if(props.myMembershipRecord.userRole >= Role.ADMIN){
                                            sockCtx.replyInvite(invite.id, false);
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
    );
}