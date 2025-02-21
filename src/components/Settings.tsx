import React, { useEffect, useState } from 'react';
import { Flex, Drawer, Group, Button, List, Paper, Text, Divider, ActionIcon } from '@mantine/core';
import { ColorPicker } from '@mantine/core';
import { FaEyeDropper } from "react-icons/fa";
import EditableTextbox from "@trz/components/EditableTextbox";
import { useSocket } from "@trz/util/socket-context";
import { useTRZ } from '@trz/util/TRZ-context';
import { NoteType, notify } from '@trz/util/notifications';

const Settings = ({ boardData }: { boardData: any }) => {
  const [localLabels, setLocalLabels] = useState<{ id: string; name: string; color: string }[]>([]);
  const [boardName, setBoardName] = useState('');
  const [boardCode, setBoardCode] = useState('');
  const [isLabelOpen, setLabelOpen] = useState(false);
  const [newLabel, setNewLabel] = useState<{ id: string; name: string; color: string }>({ id: "", name: "", color: "#D3D3D3" });
  const [openPickerIndex, setOpenPickerIndex] = useState<number | null>(null); 
  const sockCtx = useSocket();
  const trz = useTRZ();

  useEffect(()=>{
    fetchBoardData();
  }, []);

  const fetchBoardData = async () => {
    if (!boardData) return;
    setLocalLabels(boardData?.labels || []);
    setBoardName(boardData?.name || '');
    setBoardCode(boardData?.boardCode || '');
  };

  const handleColorChange = (index: number, color: string) => {
    setLocalLabels((prevLabels) => {
      const updatedLabels = [...prevLabels];
      updatedLabels[index] = { ...updatedLabels[index], color, name: boardData.labels[index].name };
      return updatedLabels;
    });
  };

  const handleLabelChange = (index: number, name: string) => {
    setLocalLabels((prevLabels) => {
      const updatedLabels = [...prevLabels];
      updatedLabels[index] = { ...updatedLabels[index], name };
      return updatedLabels;
    });
  };

  const addColor = () => {
    setLabelOpen(prev => !prev);
  };

  const confirmLabel = () => {
    if (!newLabel.name.trim()) return;
    newLabel.id = crypto.randomUUID();
    setLocalLabels((prevLabels) => [...prevLabels, newLabel]);
    setNewLabel({ id: "", name: "", color: "" });
    setLabelOpen(false);
  };

  const toggleColorPicker = (index: number) => {
    setOpenPickerIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  function confirmSettings() {
    sockCtx.updateBoardSettings(boardData.id, { boardName: boardName, boardCode: boardCode, labels: localLabels, visibility: 'Public'}).then((success) => {
        if (!success) {
            notify(NoteType.SETTINGS_UPDATE_ERROR);
            return;
        }
    });
  }
  function confirmCancel() {
    fetchBoardData();
  }

  return (
    <Drawer
      opened={trz.isVisible}
      onClose={() => trz.openSettings(false)}
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
      {boardData && (
        <Paper style={{ width: '100%', backgroundColor: 'black', color: 'white' }}>
          <List withPadding={false} listStyleType="none">
            <List.Item>
              <Text style={{ fontSize: '18px' }}>Board Name</Text>
            </List.Item>
            <List.Item>
              <EditableTextbox
                value={boardName || boardData.name}
                onChange={(value) => setBoardName(value)}
                placeholder="Click to edit!"
                type="title"
                titleProps={{ order: 6, c: "#ffffff" }}
              />
            </List.Item>
            <Divider my="sm" />
            <List.Item>
              <Text style={{ fontSize: '18px' }}>Board Code</Text>
            </List.Item>
            <List.Item>
              <EditableTextbox
                value={boardCode || boardData.boardCode}
                onChange={(value) => setBoardCode(value)}
                placeholder="Click to edit!"
                type="title"
                titleProps={{ order: 6, c: "#ffffff" }}
              />
            </List.Item>
            <Divider my="sm" />
            <List.Item>
              <Text style={{ fontSize: '18px' }}>Board Visibility</Text>
            </List.Item>
            <List.Item>
              <Text style={{ fontSize: '16px' }}>Public</Text>
            </List.Item>
            <Divider my="sm" />
            <List.Item>
              <Text style={{ fontSize: '18px' }}>Labels</Text>
            </List.Item>

            {(localLabels.length > 0 ? localLabels : boardData?.labels || []).map((label, index) => 
            <div key={index} style={{ position: 'relative', width: '100%' }}>
              <Group mt="sm" style={{ display: 'flex', alignItems: 'center' }}>
                <Button
                  style={{
                    backgroundColor: label.color,
                    width: '80%',
                    height: '30px',
                    border: 'none',
                    marginRight: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0',
                  }}
                >
                  <EditableTextbox
                    value={label.name}
                    onChange={(newLabel) => handleLabelChange(index, newLabel)}
                    placeholder="Click to edit!"
                    type="title"
                    titleProps={{ order: 6, c: "#ffffff", ta: "center" }}
                  />
                </Button>
                
                <ActionIcon variant="subtle" onClick={() => toggleColorPicker(index)}>
                  <FaEyeDropper size={24} color="white" />
                </ActionIcon>
              </Group>
              {openPickerIndex === index && ( 
              <div style={{ position: 'absolute', top: '30px', right: '10px', zIndex: 100 }}>
                <ColorPicker
                  value={label.color}
                  onChange={(newColor) => handleColorChange(index, newColor)}
                  format="hex"
                  swatches={[
                    '#2e2e2e', '#868e96', '#fa5252', '#e64980', '#be4bdb', '#7950f2',
                    '#4c6ef5', '#228be6', '#15aabf', '#12b886', '#40c057', '#82c91e',
                    '#fab005', '#fd7e14',
                  ]}
                />
              </div>
                )}
            </div>
            )}

            <Flex justify="center" mt="sm" mb="lg">
              <Button onClick={addColor} variant="light" style={{backgroundColor: 'white', color: 'black'}}>
                Add Label
              </Button>
            </Flex>
            {isLabelOpen && (
              <Group align="center" justify="center"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                borderRadius: '12px', 
                backdropFilter: 'blur(10px)', 
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
                padding: '20px', 
              }}>
                <input
                  type="text"
                  value={newLabel.name}
                  onChange={(e) => setNewLabel({ ...newLabel, name: e.target.value })}
                  placeholder="Enter label name"
                  style={{ padding: "5px", margin: "10px" }}
                />
                <ColorPicker
                  value={newLabel.color}
                  onChange={(newColor) => setNewLabel({ ...newLabel, color: newColor })}
                  format="hex"
                  swatches={[
                    '#2e2e2e', '#868e96', '#fa5252', '#e64980', '#be4bdb', '#7950f2',
                    '#4c6ef5', '#228be6', '#15aabf', '#12b886', '#40c057', '#82c91e',
                    '#fab005', '#fd7e14',
                  ]}
                />
                <Button onClick={confirmLabel} style={{backgroundColor: 'white', color: 'black'}}>
                  Confirm Label
                </Button>
              </Group>
            )}
          <Flex justify="center" gap="md" mt="sm">
            <Button onClick={() => confirmSettings()} color="cyan">
              Save Settings
            </Button>
            <Button color="gray" variant="outline" onClick={()=>confirmCancel()}>
              Cancel
            </Button>
          </Flex>
          </List>
        </Paper>
      )}
    </Drawer>
  );
};

export default Settings;
