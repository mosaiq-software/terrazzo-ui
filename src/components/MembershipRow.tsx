import React from "react";
import {User, UserId} from "@mosaiq/terrazzo-common/types";
import { Role, RoleNames } from "@mosaiq/terrazzo-common/constants";
import { Avatar, Title, Grid, Button, Select, Tooltip} from "@mantine/core";
import { IoMdClose } from "react-icons/io";
import { NoteColor } from "@trz/util/notifications";

interface MembershipRowProps {
    user: User;
    userPerm: Role;
    editorPermLevel: Role;
    onEditRole: (userId:UserId, role:Role) => void;
    onRemoveMember: (userId: UserId) => void;
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
                    <Select
                        placeholder="Role"
                        data={[
                            RoleNames[Role.READ],
                            RoleNames[Role.WRITE],
                            RoleNames[Role.ADMIN]
                        ]}
                        value={RoleNames[props.userPerm]}
                        allowDeselect={false}
                        disabled={props.editorPermLevel < Role.ADMIN || props.userPerm === Role.OWNER}
                    />
                }
            </Grid.Col>
            <Grid.Col span={1}>
                { props.editorPermLevel >= Role.ADMIN &&
                    <Tooltip
                        label="Remove Member"
                        bg={NoteColor.ERROR}
                    >
                        <Button variant="subtle" c={NoteColor.ERROR}><IoMdClose/></Button>
                    </Tooltip>
                }
            </Grid.Col>
        </Grid>

    )
}