import React from "react";
import { Menu } from "@mantine/core";
import {Priority} from "@mosaiq/terrazzo-common/types";

interface PriorityButtonProps {
    Color: string;
    buttonText: string;
}

export const priorityColor: string[] = [
    "#4A82C7",
    "#24296A",
    "#422760",
    "#853974",
    "#BD3758"
]

const PriorityButton = (props: PriorityButtonProps): React.JSX.Element => {
    const [color, setColor] = React.useState("");
    const [number, setNumber] = React.useState("");

    function onClick(){
        setColor(props.Color);
        setNumber(props.buttonText);
        console.log("Priority Button Clicked: " + props.buttonText);
    }

    return (
        <>
            <Menu.Item bg={props.Color} ta='center' c='white' onClick={onClick}>{props.buttonText}</Menu.Item>
        </>
    )
}

export const PriorityButtons = (): React.JSX.Element => {
    const awfulEnum = Object.keys(Priority).filter(key=> !isNaN(Number(key)));

    return (
        <>
            {
                awfulEnum.map((key, index) => (
                    <PriorityButton Color={priorityColor[index]} buttonText={key} key={index}/>
                ))
            }
            <PriorityButton Color={"gray"} buttonText={"Remove Priority"}/>
        </>
    )
}