import React from "react";
import { Box, Group, Title, Tabs, Stack } from "@mantine/core";
import { Role, EntityType } from "@mosaiq/terrazzo-common/constants";
import { notify, NoteType } from "@trz/util/notifications";
import { MdOutlinePerson, MdOutlineMailOutline } from "react-icons/md";
import { AddUser } from "@trz/components/AddUser";
import { MembershipRow } from "@trz/components/MembershipRow";
import { MembershipRecord, OrganizationId } from "@mosaiq/terrazzo-common/types";
import {PendingInviteRow} from "@trz/components/PendingInviteRow";
import { useSocket } from "@trz/contexts/socket-context";
interface OrgTabMembersProps {
    myMembershipRecord: MembershipRecord;
    orgId: OrganizationId;
}
export const OrgTabMembers = (props: OrgTabMembersProps) => {
    const sockCtx = useSocket();

    if(!sockCtx.orgData) {
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
                            if(sockCtx.orgData?.isPersonalOrg){
                                notify(NoteType.ADD_TO_PERSONAL_ORG_ERROR);
                                return false;
                            }
                            const invite = await sockCtx.sendInvite(username, props.orgId, EntityType.ORG, role);
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
                    <Tabs.Tab value="members" leftSection={<MdOutlinePerson size={18} />}>Members ({sockCtx.orgData.members.length})</Tabs.Tab>
                    <Tabs.Tab value="invites" leftSection={<MdOutlineMailOutline size={18} />}>Invites ({sockCtx.orgData.invites.length})</Tabs.Tab>
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
                            sockCtx.orgData.members.map((member)=>(
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
                                        if(props.myMembershipRecord.userRole >= Role.ADMIN && member.record.userRole < Role.OWNER && props.myMembershipRecord.userId !== member.record.userId){
                                            sockCtx.revokeMembershipRecord(member.record.id);
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
                            sockCtx.orgData.invites.map((invite)=>(
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