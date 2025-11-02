import React from "react";
import { Box, Button, Flex, Menu, Text, Tooltip } from "@mantine/core";
import { Priority } from "@mosaiq/terrazzo-common/constants";
import { Card } from "@mosaiq/terrazzo-common/types";
import { useSocket } from "@trz/contexts/socket-context";
import { NoteType, notify } from "@trz/util/notifications";
import { updateCardField } from "@trz/emitters/all";

export const priorityColors: string[] = [
    "gray",
    "#4A82C7",
    "#24296A",
    "#422760",
    "#853974",
    "#BD3758"
]

export const unicodeMap = {
    0: "-",
    [Priority.LOWEST]: '\u25BC' + '\u25BC', // ▼▼
    [Priority.LOW]: '\u25BC', // ▼
    [Priority.MEDIUM]: '\u25FC',  // ■
    [Priority.HIGH]: '\u25B2', // ▲
    [Priority.HIGHEST]: '\u25B2' + '\u25B2' // ▲▲
};

export const prioNames = {
    0: "Unset",
    [Priority.LOWEST]: "Lowest",
    [Priority.LOW]: "Low",
    [Priority.MEDIUM]: "Medium",
    [Priority.HIGH]: "High",
    [Priority.HIGHEST]: "Critical",
};

interface PriorityButtonsProps {
    card: Card;
}
export const PriorityButtons = (props: PriorityButtonsProps): React.JSX.Element => {
    const priority = props.card.priority ?? 0;
    const sockCtx = useSocket();

    const handleOnChange = async (newPriority: Priority) => {
        if(!props.card.id){
            return;
        }
        try{
            await updateCardField(sockCtx, props.card.id, {priority: newPriority});
        }catch (e){
            notify(NoteType.CARD_UPDATE_ERROR);
            return;
        }
    };

    return (
        <Menu
            position="bottom"
            withArrow
            arrowPosition="center"
            withOverlay={true}
            closeOnClickOutside={true}
        >
            <Menu.Target>
                <Tooltip label="Set Priority" position="top" withArrow>
                    <Button
                        bg={"red"}
                        justify={"flex-start"}
                    >
                        <Box bg={priorityColors[priority]} w='35' style={{ '--radius': '0.3rem', borderRadius: 'var(--radius)' }}>
                            <Text c='white' ta='center'>{unicodeMap[priority]}</Text>
                        </Box>
                    </Button>
                </Tooltip>
            </Menu.Target>
            <Menu.Dropdown>
                <Flex direction="column-reverse" align="center">
                {
                    priorityColors.map((_, index) => {
                        return (
                            <Tooltip key={index} label={prioNames[index]} position="right" withArrow>
                                <Menu.Item
                                    key={index}
                                    bg={priorityColors[index]}
                                    ta='center'
                                    c='white'
                                    onClick={()=>{
                                        handleOnChange(index);
                                    }}
                                >
                                    {`${unicodeMap[index]}`}
                                </Menu.Item>
                            </Tooltip>
                        )
                    })
                }
                <Menu.Label>Card Priority</Menu.Label>
                </Flex>
            </Menu.Dropdown>
        </Menu>
    );
};