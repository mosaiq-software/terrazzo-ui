import React from "react";
import { Menu } from "@mantine/core";
import {Priority} from "@mosaiq/terrazzo-common/constants";
import {NoteType, notify} from "@trz/util/notifications";
import { CardId } from "@mosaiq/terrazzo-common/types";

interface PriorityButtonProps {
    color: string;
    buttonText: string;
    onClick: (priority:Priority|null)=>void;
}
export const priorityColors: string[] = [
    "#4A82C7",
    "#24296A",
    "#422760",
    "#853974",
    "#BD3758"
]

const PriorityButton = (props: PriorityButtonProps): React.JSX.Element => {
    async function onClick(){
        let priority: Priority|null = null;
        switch(props.buttonText){
            case "1":
                priority = Priority.LOWEST;
                break
            case "2":
                priority = Priority.LOW;
                break
            case "3":
                priority = Priority.MEDIUM;
                break
            case "4":
                priority = Priority.HIGH;
                break
            case "5":
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
    onChange: (priority:Priority|null)=>void;
}
export const PriorityButtons = (props: PriorityButtonsProps): React.JSX.Element => {
    const priorityLength = Object.keys(Priority).length / 2;

    return (
        <>
            {
                Array.from({length: priorityLength}).map((_, index) => {
                    return (
                        <PriorityButton
                            color={priorityColors[index]}
                            buttonText={`${index + 1}`}
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