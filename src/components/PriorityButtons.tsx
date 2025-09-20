import React from "react";
import { Menu } from "@mantine/core";
import { Priority } from "@mosaiq/terrazzo-common/constants";
import { NoteType, notify } from "@trz/util/notifications";
import { CardId } from "@mosaiq/terrazzo-common/types";
import { FiChevronsUp } from "react-icons/fi";

interface PriorityButtonProps {
    color: string;
    buttonText: string;
    onClick: (priority: Priority | null) => void;
}
export const priorityColors: string[] = [
    "#4A82C7",
    "#24296A",
    "#422760",
    "#853974",
    "#BD3758"
]

export const unicodeMap = {
    1: '\u25BC' + '\u25BC', // ▼▼
    2: '\u25BC', // ▼
    3: '\u25FC',  // ■
    4: '\u25B2', // ▲
    5: '\u25B2' + '\u25B2' // ▲▲
};

const PriorityButton = (props: PriorityButtonProps): React.JSX.Element => {
    async function onClick() {
        let priority: Priority | null = null;
        switch (props.buttonText) {
            case "\u25BC' + '\u25BC":
                priority = Priority.LOWEST;
                break
            case "\u25BC":
                priority = Priority.LOW;
                break
            case "\u25FC":
                priority = Priority.MEDIUM;
                break
            case "\u25B2":
                priority = Priority.HIGH;
                break
            case "\u25B2' + '\u25B2":
                priority = Priority.HIGHEST;
                break
            case "Remove Priority":
                priority = null;
                break
        }
        props.onClick(priority);
    }

    return (
        <Menu.Item bg={props.color} ta='center' c='white' onClick={onClick}>{props.buttonText}</Menu.Item>
    )
}

interface PriorityButtonsProps {
    onChange: (priority: Priority | null) => void;
}
export const PriorityButtons = (props: PriorityButtonsProps): React.JSX.Element => {
    const priorityLength = Object.keys(Priority).length / 2;

    return (
        <>
            {
                Array.from({ length: priorityLength }).map((_, index) => {
                    const descendingIndex = priorityLength - index;
                    return (
                        <PriorityButton 
                            color={priorityColors[descendingIndex - 1]}
                            buttonText={`${unicodeMap[descendingIndex]}`}
                            key={index}
                            onClick={props.onChange}
                        />
                    )
                })
            }
            <PriorityButton
                color={"gray"}
                buttonText={"Remove Priority"}
                onClick={props.onChange}
            />
        </>
    )
}