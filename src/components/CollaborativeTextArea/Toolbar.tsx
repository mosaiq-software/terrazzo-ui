import React from 'react';
import { Divider, Group } from '@mantine/core';
import {
  BasicFormattingButtonGroup,
  CalloutTypeButtonGroup,
  DataTransferButtonGroup,
  HeadingLevelButtonGroup,
  HistoryButtonGroup,
  ListButtonGroup,
} from './button-groups';
import { CreateTableButton } from './buttons';

export const CollabTextAreaToolbar = () => {
  return (
    <Group gap={0}>
        <HistoryButtonGroup />
        <VerticalDivider />
        <DataTransferButtonGroup />
        <VerticalDivider />
        <HeadingLevelButtonGroup showAll/>
        <VerticalDivider />
        <BasicFormattingButtonGroup />
        <VerticalDivider />
        <ListButtonGroup>
            <CreateTableButton />
        </ListButtonGroup>
        <VerticalDivider />
        <CalloutTypeButtonGroup />
    </Group>
    );
};

const VerticalDivider = () => <Divider orientation="vertical" mx="sm" />;