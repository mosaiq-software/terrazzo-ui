import React from "react";
import { Menu } from "@mantine/core";
import {Priority} from "@mosaiq/terrazzo-common/constants";
import {useSocket} from "@trz/util/socket-context";
import {getCard} from "@trz/util/boardUtils";
import {useTRZ} from "@trz/util/TRZ-context";
import {NoteType, notify} from "@trz/util/notifications";

interface PriorityButtonProps {
    Color: string;
    buttonText: string;
}

export const priorityColors: string[] = [
    "#4A82C7",
    "#24296A",
    "#422760",
    "#853974",
    "#BD3758"
]

const PriorityButton = (props: PriorityButtonProps): React.JSX.Element => {
    const sockCtx = useSocket();
    const trzCtx = useTRZ();

    async function onClick(){
        let priority;
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

        if(!trzCtx.openedCardModal){
            notify(NoteType.CARD_UPDATE_ERROR);
            return;
        }
        try{
            await sockCtx.updateCardField(trzCtx.openedCardModal, {priority: priority});
        }catch (e){
            notify(NoteType.CARD_UPDATE_ERROR);
            return;
        }
    }

    return (
            <Menu.Item bg={props.Color} ta='center' c='white' onClick={onClick}>{props.buttonText}</Menu.Item>
    )
}

export const PriorityButtons = (): React.JSX.Element => {
    const priorityLength = Object.keys(Priority).length / 2;

    return (
        <>
            {
                Array.from({length: priorityLength}).map((_, index) => {
                    return (
                        <PriorityButton Color={priorityColors[index]} buttonText={`${index + 1}`} key={index}/>
                    )
                })
            }
            <PriorityButton Color={"gray"} buttonText={"Remove Priority"}/>
        </>
    )
}