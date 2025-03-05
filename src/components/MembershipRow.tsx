import React from "react";
import {MembershipRecord, MembershipRecordId, UserHeader, UserId} from "@mosaiq/terrazzo-common/types";
import { Role, RoleNames } from "@mosaiq/terrazzo-common/constants";
import { Avatar, Title, Grid, Button, Select, Tooltip} from "@mantine/core";
import { IoMdClose } from "react-icons/io";
import { NoteColor } from "@trz/util/notifications";

interface MembershipRowProps {
    user: UserHeader;
    record: MembershipRecord;
    editorsRecord: MembershipRecord;
    onEditRole: (record: MembershipRecordId, role:Role) => void;
    onRemoveMember: () => void;
}
export const MembershipRow = (props: MembershipRowProps) => {
    return (
        <Grid py="sm" style={{
            borderBottom:"1px solid #ffffff10",
        }}>
            <Grid.Col span={1}>
                <Avatar src={props.user.profilePicture} />
            </Grid.Col>
            <Grid.Col span={4}>
                <Title order={5} c="#fff">{props.user.firstName} {props.user.lastName}</Title>
            </Grid.Col>
            <Grid.Col span={4}>
                <Title order={6} c="#ddd">@{props.user.username}</Title>
            </Grid.Col>
            <Grid.Col span={2}>
                {
                    props.record.userRole < Role.OWNER &&
                    <Select
                        placeholder="Role"
                        data={[
                            RoleNames[Role.READ],
                            RoleNames[Role.WRITE],
                            RoleNames[Role.ADMIN],
                        ]}
                        value={RoleNames[props.record.userRole]}
                        allowDeselect={false}
                        disabled={props.editorsRecord.userRole < Role.ADMIN || props.record.userRole === Role.OWNER || props.editorsRecord.id === props.record.id}
                        onChange={(e)=>{
                            props.onEditRole(props.record.id, RoleNames.indexOf(e ?? RoleNames[Role.READ]));
                        }}
                    />
                }
                {
                    props.record.userRole === Role.OWNER &&
                    <Select
                        placeholder="Role"
                        data={[
                            RoleNames[Role.OWNER],
                        ]}
                        value={RoleNames[Role.OWNER]}
                        allowDeselect={false}
                        disabled={true}
                    />
                }
            </Grid.Col>
            <Grid.Col span={1}>
                { props.editorsRecord.userRole >= Role.ADMIN &&
                    <Tooltip
                        label={props.record.userRole >= Role.OWNER ? "Can't Remove Owner" : props.editorsRecord.id === props.record.id ? "Can't Remove Yourself" : "Remove Member"}
                        bg={NoteColor.ERROR}
                    >
                        <Button
                            disabled={props.record.userRole >= Role.OWNER}
                            variant="subtle"
                            c={NoteColor.ERROR}
                            onClick={()=>{
                                props.onRemoveMember();
                            }}
                        ><IoMdClose/></Button>
                    </Tooltip>
                }
            </Grid.Col>
        </Grid>

    )
}