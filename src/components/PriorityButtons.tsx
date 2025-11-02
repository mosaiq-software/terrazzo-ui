import React from "react";
import { Button, Flex, Menu } from "@mantine/core";
import { Priority } from "@mosaiq/terrazzo-common/constants";
import { NoteType, notify } from "@trz/util/notifications";
import { CardId } from "@mosaiq/terrazzo-common/types";
import { FiChevronsUp } from "react-icons/fi";
import { MdOutlinePriorityHigh } from "react-icons/md";

export const priorityColors: string[] = [
    "gray",
    "#4A82C7",
    "#24296A",
    "#422760",
    "#853974",
    "#BD3758"
]

export const unicodeMap = {
    0: "None",
    [Priority.LOWEST]: '\u25BC' + '\u25BC', // ▼▼
    [Priority.LOW]: '\u25BC', // ▼
    [Priority.MEDIUM]: '\u25FC',  // ■
    [Priority.HIGH]: '\u25B2', // ▲
    [Priority.HIGHEST]: '\u25B2' + '\u25B2' // ▲▲
};

interface PriorityButtonsProps {
    onChange: (priority: Priority | null) => void;
}
export const PriorityButtons = (props: PriorityButtonsProps): React.JSX.Element => {
    return (
        <Menu
            position='right-start'
            withArrow
            arrowPosition="center"
            withOverlay={true}
            closeOnClickOutside={true}
        >
            <Menu.Target>
                <Button
                    bg={"red"}
                    leftSection={<MdOutlinePriorityHigh />}
                    justify={"flex-start"}
                >
                    Card Priority
                </Button>
            </Menu.Target>
            <Menu.Dropdown>
                <Flex direction="column-reverse" align="center">
                {
                    priorityColors.map((_, index) => {
                        return (
                            <Menu.Item
                                key={index}
                                bg={priorityColors[index]}
                                ta='center'
                                c='white'
                                onClick={()=>{
                                    props.onChange(index)
                                }}
                            >
                                {`${unicodeMap[index]}`}
                            </Menu.Item>
                        )
                    })
                }
                <Menu.Label>Card Priority</Menu.Label>
                </Flex>
            </Menu.Dropdown>
        </Menu>
    );
};