import React from "react";
import {Avatar, Tooltip, Text} from "@mantine/core";
import {UserHeader} from "@mosaiq/terrazzo-common/types";

interface AvatarRowProps {
    users: UserHeader[];
    maxUsers: number;
}
export const AvatarRow = (props: AvatarRowProps) => {

    return (
        <Avatar.Group spacing="sm" style={{ justifyContent: "flex-end" }}>
            {
                // only take the first n users
                props.users.slice(0, props.maxUsers).map((user, index) =>
                    <Tooltip key={index} label={user.firstName + " " + user.lastName + "(" + user.username + ")"} position="bottom" withArrow radius="lg">
                        <Avatar src={user.profilePicture} size="sm" name={user.firstName + " " + user.lastName} color="initials"/>
                    </Tooltip>
                )
            }
            {
                // if there are more than n users, show a +{n} avatar
                props.users.length > props.maxUsers && (
                    <Tooltip position="bottom" withArrow radius="lg"
                        label={
                            props.users.slice(props.maxUsers).map((user, index) =>
                                <Text key={index}>{user.firstName + " " + user.lastName + "(" + user.username + ")"}</Text>
                            )
                        }
                    >
                        <Avatar size="sm">+{props.users.length - 3}</Avatar>
                    </Tooltip>
                )
                        
            }
        </Avatar.Group>
    )
}