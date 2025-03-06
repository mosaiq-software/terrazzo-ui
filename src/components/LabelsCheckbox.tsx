import React from 'react';
import {Box, Button, Checkbox, Divider, Grid, Menu, TextInput} from "@mantine/core";

interface LabelsCheckboxProps {
    title: string;
}



export const LabelsCheckbox = (props:LabelsCheckboxProps): React.JSX.Element => {



    return (
        <>
            <Checkbox label={props.title}/>
        </>
    )
}
export const CreateLabel = (): React.JSX.Element => {
    return (
        <>
            <Menu>
                <Menu.Target>
                    <Button>Add a new Label</Button>
                </Menu.Target>
                <Menu.Dropdown>
                    <Box>
                        <TextInput label='Title'/>
                        <Grid>
                            <Grid.Col span={4} bg='blue'></Grid.Col>
                            <Grid.Col span={4} bg='red'></Grid.Col>
                            <Grid.Col span={4} bg='black'></Grid.Col>
                            <Grid.Col span={4} bg='yellow'></Grid.Col>
                            <Grid.Col span={4} bg='green'></Grid.Col>
                        </Grid>
                        <Divider/>
                        <Button>Create</Button>
                    </Box>
                </Menu.Dropdown>
            </Menu>
        </>
    )
}