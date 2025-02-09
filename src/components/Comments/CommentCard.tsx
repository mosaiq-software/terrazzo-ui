import React from "react";
import { Paper, Avatar, Group, Text } from "@mantine/core";

const CommentCard = ({ avatarSrc, name, time, comment }) => {
    return (
        <Paper p="md" radius="md" withBorder mx="md">
            <Group>
                <Avatar src={avatarSrc} alt={name} radius="xl"/>
                <div>
                    <Text size="sm" weight={500}>{name}</Text>
                    <Text size="xs" c="dimmed">{time}</Text>
                </div>
            </Group>
            <Text pl={54} pt="sm" size="sm">{comment}</Text>
        </Paper>
    );
};

export default CommentCard;
