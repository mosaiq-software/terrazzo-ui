import React from "react";
import { Paper, Avatar, Group, Text } from "@mantine/core";
import { ISO_Date, User } from "@mosaiq/terrazzo-common/types";

interface CommentProps {
   content: string,
   postedAt: ISO_Date,
   postedById: string,
}

const CommentCard = (props: CommentProps) => {
    return (
        <Paper p="md" radius="md" withBorder mx="md">
            <Group>
                <Avatar src={""} alt={props.postedById} radius="xl"/>
                <div>
                    <Text size="sm">{props.postedById}</Text>
                    <Text size="xs" c="dimmed">{props.postedAt}</Text>
                </div>
            </Group>
            <Text pl={54} pt="sm" size="sm">{props.content}</Text>
        </Paper>
    );
};

export default CommentCard;
