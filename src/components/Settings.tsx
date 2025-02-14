import React, { useState } from 'react';
import { Drawer, Group, Button, List, Paper, Text, Divider, ActionIcon } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeDropper } from '@fortawesome/free-solid-svg-icons';
import { ColorPicker } from '@mantine/core';

let colorOptions = ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#FFD700", "#6A5ACD", "#FF4500", "#008080"];

const Settings = ({ boardData, isVisible, onClose }: { boardData: any, isVisible: boolean, onClose: () => void }) => {
  const [selectedColors, setSelectedColors] = useState<string[]>(colorOptions);
  const [openPickerIndex, setOpenPickerIndex] = useState<number | null>(null); 

  const handleColorChange = (index: number, color: string) => {
    const updatedColors = [...selectedColors];
    updatedColors[index] = color;
    setSelectedColors(updatedColors);
  };

  const togglePicker = (index: number) => {
    setOpenPickerIndex((prevIndex) => (prevIndex === index ? null : index)); 
  };

  const addColor = () => {
    setSelectedColors(prevColors => [...prevColors, "#D3D3D3"]);
  };
  console.log(boardData)
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
      {boardData && (
        <Paper style={{ width: '100%', backgroundColor: 'black', color: 'white' }}>
          <List withPadding={false} listStyleType="none">
          <List.Item>
              <Text style={{ fontSize: '18px' }}>Board Name</Text>
            </List.Item>
            <List.Item>
              <Text style={{ fontSize: '16px' }}>{boardData.name}</Text>
            </List.Item>
            <Divider my="sm" />
            <List.Item>
              <Text style={{ fontSize: '18px' }}>Board Code</Text>
            </List.Item>
            <List.Item>
              <Text style={{ fontSize: '16px' }}>{boardData.boardCode}</Text>
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

            {selectedColors.map((color, index) => (
              <div key={index} style={{ position: 'relative', width: '100%' }}>
                <Group mt="sm" style={{ display: 'flex', alignItems: 'center' }}>
                  <Button
                    style={{
                      backgroundColor: color,
                      width: '80%',
                      height: '20px',
                      border: 'none',
                      marginRight: '10px',
                    }}
                  >
                    Label {index + 1}
                  </Button>

                  <ActionIcon variant="subtle" onClick={() => togglePicker(index)}>
                    <FontAwesomeIcon icon={faEyeDropper} />
                  </ActionIcon>
                </Group>

                {openPickerIndex === index && (
                  <div style={{ position: 'absolute', top: '30px', right: '10px', zIndex: 100 }}>
                    <ColorPicker
                      value={color}
                      onChange={(newColor) => handleColorChange(index, newColor)}
                      format="hex"
                      swatches={[
                        '#2e2e2e', '#868e96', '#fa5252', '#e64980', '#be4bdb', '#7950f2',
                        '#4c6ef5', '#228be6', '#15aabf', '#12b886', '#40c057', '#82c91e',
                        '#fab005', '#fd7e14'
                      ]}
                    />
                  </div>
                )}
              </div>
            ))}
            <Button mt="sm" color="gray" onClick={addColor}>
              Add Label
            </Button>
          </List>
        </Paper>
      )}
    </Drawer>
  );
};

export default Settings;
