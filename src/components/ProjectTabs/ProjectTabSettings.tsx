import React, { useEffect, useState } from "react";
import { Box, Title, Stack, TextInput, Textarea, Group, Button, Divider, Space } from "@mantine/core";
import { Role } from "@mosaiq/terrazzo-common/constants";
import { DEFAULT_AUTHED_ROUTE } from "@trz/contexts/user-context";
import { notify, NoteType } from "@trz/util/notifications";
import { MembershipRecord, ProjectHeader, ProjectId } from "@mosaiq/terrazzo-common/types";
import { useSocket } from "@trz/contexts/socket-context";
import { useNavigate } from "react-router-dom";

interface ProjectTabSettingsProps {
    myMembershipRecord: MembershipRecord;
    projectId: ProjectId;
}
export const ProjectTabSettings = (props: ProjectTabSettingsProps) => {
    const [editedSettings, setEditedSettings] = useState<Partial<ProjectHeader>>({});
    const sockCtx = useSocket();
    const navigate = useNavigate();

    useEffect(()=>{
        if(sockCtx.projectData)
            setEditedSettings(sockCtx.projectData);
    }, [sockCtx.projectData]);

    if(!sockCtx.projectData) {
        return null;
    }

    return (
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
                        label="Project Name"
                        placeholder="My Project"
                        value={editedSettings.name ?? ''}
                        onChange={(e)=>{
                            setEditedSettings({...editedSettings, name: e.target.value});
                        }}
                        disabled={props.myMembershipRecord.userRole < Role.ADMIN}
                    />
                    <Textarea
                        labelProps={{
                            c:"white"
                        }}
                        label="Project Description"
                        placeholder="Write some info about your project"
                        value={editedSettings.description ?? ''}
                        onChange={(e)=>{
                            setEditedSettings({...editedSettings, description: e.target.value});
                        }}
                        disabled={props.myMembershipRecord.userRole < Role.ADMIN}
                    />
                    <TextInput
                        labelProps={{
                            c:"white"
                        }}
                        label="Project Logo URL"
                        placeholder="https://mosaiq.dev/logo.png"
                        value={editedSettings.logoUrl ?? ''}
                        onChange={(e)=>{
                            setEditedSettings({...editedSettings, logoUrl: e.target.value});
                        }}
                        disabled={props.myMembershipRecord.userRole < Role.ADMIN}
                    />
                    <Group>
                        <Button 
                            variant="outline"
                            disabled={props.myMembershipRecord.userRole < Role.ADMIN}
                            onClick={()=>{
                                setEditedSettings(sockCtx.projectData ?? {});
                            }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="filled"
                            disabled={props.myMembershipRecord.userRole < Role.ADMIN}
                            onClick={async ()=>{
                                if(props.myMembershipRecord.userRole < Role.ADMIN){
                                    notify(NoteType.UNAUTHORIZED);
                                    return;
                                }
                                try {
                                    sockCtx.updateProjectField(props.projectId, editedSettings);
                                    sockCtx.syncUserDash();
                                    notify(NoteType.CHANGES_SAVED);
                                } catch (e) {
                                    notify(NoteType.PROJECT_DATA_ERROR, e);
                                }

                            }}
                        >
                            Save
                        </Button>
                    </Group>
                    <Divider/>
                    <Space/>
                    <Group gap="sm">
                        <Button 
                            variant="light"
                            color="red"
                            w="min-content"
                            disabled={props.myMembershipRecord.userRole >= Role.OWNER}
                            onClick={async ()=>{
                                if(props.myMembershipRecord.userRole >= Role.OWNER){
                                    notify(NoteType.UNAUTHORIZED);
                                    return;
                                }
                                try {
                                    sockCtx.revokeMembershipRecord(props.myMembershipRecord.id);
                                    sockCtx.syncUserDash();
                                    notify(NoteType.LEFT_ENTITY, [sockCtx.projectData?.name]);
                                    navigate(DEFAULT_AUTHED_ROUTE);
                                } catch (e) {
                                    notify(NoteType.PROJECT_DATA_ERROR, e);
                                }

                            }}
                        >
                            Leave Project
                        </Button>
                        <Button 
                            variant="light"
                            color="red"
                            w="min-content"
                            disabled={props.myMembershipRecord.userRole < Role.OWNER}
                            onClick={async ()=>{
                                if(props.myMembershipRecord.userRole < Role.OWNER){
                                    notify(NoteType.UNAUTHORIZED);
                                    return;
                                }
                                try {
                                    sockCtx.updateProjectField(props.projectId, {archived: true});
                                    sockCtx.syncUserDash();
                                    notify(NoteType.CHANGES_SAVED);
                                    navigate(DEFAULT_AUTHED_ROUTE);
                                } catch (e) {
                                    notify(NoteType.PROJECT_DATA_ERROR, e);
                                }

                            }}
                        >
                            Archive Project
                        </Button>
                    </Group>
                </Stack>
            </Box>
        </Box>
    );
}