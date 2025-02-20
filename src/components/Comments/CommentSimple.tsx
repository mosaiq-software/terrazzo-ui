import React from "react";
import {
    Avatar,
    Group,
    Text,
} from "@mantine/core";
import { ISO_Date, User } from "@mosaiq/terrazzo-common/types";


interface CommentProps {
    content: string,
    postedAt: ISO_Date,
    postedById: string,
 }

export function CommentSimple(props: CommentProps) {
    return (
        <div>
            <Group>
                <Avatar
                    src={""}
                    alt={props.postedById}
                    radius="xl"
                />
                <div>
                    <Text size="sm">{props.postedById}</Text>
                    <Text size="xs" c="dimmed">
                        {props.postedById}
                    </Text>
                </div>
            </Group>
            <Text pl={54} pt="sm" size="sm">
                {props.content}
            </Text>
        </div>
    );
}