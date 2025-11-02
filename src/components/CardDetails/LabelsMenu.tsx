import { Box, Button, Checkbox, MantineSize, Menu, Pill, Stack, Text, Tooltip } from '@mantine/core';
import { Card, LabelId } from '@mosaiq/terrazzo-common/types';
import { useSocket } from '@trz/contexts/socket-context';
import { useTRZ } from '@trz/contexts/TRZ-context';
import { updateCardsLabels } from '@trz/emitters/all';
import { colorIsDarkAdvanced } from '@trz/util/colorUtils';
import React, { useMemo } from 'react';
import { MdAddCircleOutline, MdCheck } from 'react-icons/md';

interface LabelsMenuProps {
    card: Card;
}

export const LabelsMenu = (props: LabelsMenuProps) => {
    const trzCtx = useTRZ();
    const sockCtx = useSocket();
    
    return (
        <Menu
            position='bottom-start'
            withArrow
            arrowPosition="side"
            closeOnClickOutside={true}
            trigger="hover"
            closeDelay={200}
        >
            <Menu.Target>
                {trzCtx.boardData?.labels.length && (
                    <Button
                        variant='subtle'
                        justify={"flex-start"}
                    >
                        <LabelDisplay
                            labels={props.card.labels}
                            showAdd
                            size="sm"
                        />
                    </Button>
                )}
            </Menu.Target>
            <Menu.Dropdown ta='center' miw="10rem">
                <Menu.Label>Labels</Menu.Label>
                <Stack gap={1}>
                {
                    trzCtx.boardData?.labels.map(label=>{
                        const textColor = colorIsDarkAdvanced(label.color) ? "#fff" : "#000";
                        return (
                            <Button
                                key={label.id}
                                bg={label.color}
                                ta='left'
                                justify='start'
                                c={textColor}
                                style={{
                                    borderRadius:"4px",
                                }}
                                leftSection={
                                    <MdCheck style = {{
                                        visibility: props.card.labels.includes(label.id) ? "visible" : "hidden"
                                    }}/>
                                }
                                onClick={()=>{
                                    const labels = props.card.labels;
                                    if(labels.includes(label.id)){
                                        labels.splice(labels.indexOf(label.id), 1);
                                    } else {
                                        labels.push(label.id);
                                    }
                                    updateCardsLabels(sockCtx, props.card.id, labels);
                                }}
                            >
                                {label.name}
                            </Button>
                        )
                    })
                }
                </Stack>
            </Menu.Dropdown>
        </Menu>
    )
}


interface LabelDisplayProps {
    labels: LabelId[];
    showAdd?: boolean;
    size?: MantineSize;
}
export const LabelDisplay = (props: LabelDisplayProps) => {
    const trzCtx = useTRZ();
    return (
        <Pill.Group>
            {
                props.labels.map(labelId=>{
                    const label = trzCtx.boardData?.labels.filter(l=>l.id===labelId)[0];
                    if(!label)return null;
                    const textColor = colorIsDarkAdvanced(label.color) ? "#fff" : "#000";
                    return (
                        <Pill
                            key={label.id}
                            size={props.size}
                            bg={label.color}
                            c={textColor}
                        >
                            {label.name}
                        </Pill>
                    )
                })
            }
            {props.showAdd && <MdAddCircleOutline size="1.5rem"/>}
        </Pill.Group>
    )
}