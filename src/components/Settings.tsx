import React from 'react';
import { Drawer, Text, List, Paper } from '@mantine/core';

const Settings = ({ boardData, isVisible, onClose }: { boardData: [], isVisible: boolean, onClose: () => void }) => {
  console.log(boardData);
  return (
    <Drawer
      opened={isVisible}
      onClose={onClose}
      position="right" 
      size="sm" 
      padding="md"
      title="Settings"
      styles={{
        content: { backgroundColor: 'black', color: 'white' }, 
        title: { color: 'black' }, 
        body: { padding: '20px' }, 
      }}
    >
      <Paper style={{ width: '100%', backgroundColor: 'black', color: 'white'}}>
      <List withPadding={false} listStyleType="none">
          <List.Item>Board Name</List.Item>
          <List.Item>Board Code</List.Item>
          <List.Item>Board Visibility</List.Item>
          <List.Item>Labels</List.Item>
        </List>
      </Paper>
    </Drawer>
  );
};

export default Settings;
