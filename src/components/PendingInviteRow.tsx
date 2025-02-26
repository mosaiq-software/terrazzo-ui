import React, { useState } from "react";
import {Avatar, Button, Grid, Group, Menu, Select, TextInput, Title, Tooltip} from "@mantine/core"
import { NoteColor, NoteType, notify } from "@trz/util/notifications";
import { Role, RoleNames } from "@mosaiq/terrazzo-common/constants";
import { Invite } from "@mosaiq/terrazzo-common/types";
import { IoMdClose } from "react-icons/io";
interface PendingInviteRowProps {
    invite: Invite;
    editorPermLevel: Role;
    onRevokeInvite: ()=>void
}
export const PendingInviteRow = (props: PendingInviteRowProps) => {
    // const user = sockCtx.getUser..
    return (
        <Grid py="sm" style={{
            borderBottom:"1px solid #ffffff10",
        }}>
            <Grid.Col span={1}>
                {/* <Avatar src={props.user.profilePicture} /> */}
            </Grid.Col>
            <Grid.Col span={4}>
                {/* <Title order={5} c="#fff">{props.invite.fromUser} {props.user.lastName}</Title> */}
            </Grid.Col>
            <Grid.Col span={4}>
                {/* <Title order={6} c="#ddd">@{props.user.username}</Title> */}
            </Grid.Col>
            <Grid.Col span={2}>
                <Title order={6} c="#ddd">@{RoleNames[Role.ADMIN]}</Title>
            </Grid.Col>
            <Grid.Col span={1}>
                { props.editorPermLevel >= Role.ADMIN &&
                    <Tooltip
                        label="Revoke Invite"
                        bg={NoteColor.ERROR}
                    >
                        <Button 
                            variant="subtle"
                            c={NoteColor.ERROR}
                            onClick={props.onRevokeInvite}
                            ><IoMdClose/></Button>
                    </Tooltip>
                }
            </Grid.Col>
        </Grid>
    )
}