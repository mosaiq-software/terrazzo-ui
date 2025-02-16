import React from "react";
import {Avatar, Tooltip, Text} from "@mantine/core";

interface AvatarRowProps {
    users: {name: string, url: string}[];
    maxUsers: number;
}
export const AvatarRow = (props: AvatarRowProps) => {

    return (
        <Avatar.Group spacing="sm" style={{ justifyContent: "flex-end" }}>
            {
                // only take the first n users
                props.users.slice(0, props.maxUsers).map((user, index) =>
                    <Tooltip key={index} label={user.name} position="bottom" withArrow radius="lg">
                        <Avatar src={user.url} size="sm" />
                    </Tooltip>
                )
            }
            {
                // if there are more than n users, show a +{n} avatar
                props.users.length > props.maxUsers && (
                    <Tooltip position="bottom" withArrow radius="lg"
                        label={
                            props.users.slice(props.maxUsers).map((user, index) =>
                                <Text key={index}>{user.name}</Text>
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