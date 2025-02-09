import React from "react";
import {
    Avatar,
    Group,
    Text,
} from "@mantine/core";
export function CommentSimple({ avatarSrc, name, time, comment }) {
    return (
        <div>
            <Group>
                <Avatar
                    src={avatarSrc}
                    alt={name}
                    radius="xl"
                />
                <div>
                    <Text size="sm">{name}</Text>
                    <Text size="xs" c="dimmed">
                        {time}
                    </Text>
                </div>
            </Group>
            <Text pl={54} pt="sm" size="sm">
                {comment}
            </Text>
        </div>
    );
}