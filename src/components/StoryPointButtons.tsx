import React from "react";
import {Menu} from "@mantine/core"
import {StoryPoints} from "../../../terrazzo-common/dist/constants";
import {useSocket} from "../util/socket-context";
import {useTRZ} from "../util/TRZ-context";
import {NoteType, notify} from "../util/notifications";

interface StoryPointProps{
    buttonText: string;
}

const StoryPointButton = (props: StoryPointProps):React.JSX.Element => {
    const sockCtx = useSocket();
    const trzCtx = useTRZ();

    async function onClick(){
        let storyPoint;
        switch(props.buttonText){
            case "0":
                storyPoint = StoryPoints.ZERO;
                console.log(storyPoint);
                break
            case "1":
                storyPoint = StoryPoints.XXS;
                break
            case "2":
                storyPoint = StoryPoints.XS;
                break
            case "3":
                storyPoint = StoryPoints.S;
                break
            case "5":
                storyPoint = StoryPoints.M;
                break
            case "8":
                storyPoint = StoryPoints.L;
                break
            case "13":
                storyPoint = StoryPoints.XL;
                break
            case "21":
                storyPoint = StoryPoints.XXL;
                break
            case "Remove Story Point":
                storyPoint = null;
                break
        }

        if(!trzCtx.openedCardModal){
            notify(NoteType.CARD_UPDATE_ERROR);
            return;
        }
        try{
            console.log("this is the story" + storyPoint);
            await sockCtx.updateCardField(trzCtx.openedCardModal, {storyPoints: storyPoint});
        }catch (e){
            notify(NoteType.CARD_UPDATE_ERROR);
            return;
        }
    }

    return (
            <Menu.Item bg='gray' ta='center' c='white' onClick={onClick}>{props.buttonText}</Menu.Item>
    )
}

export const StoryPointButtons =  ():React.JSX.Element => {
    const storyPointsArray = Object.values(StoryPoints).filter(value => typeof value === 'number');

    return(
        <>
            {storyPointsArray.map((point, index) => (
                <StoryPointButton buttonText={`${point}`} key={index} />
            ))}
            <StoryPointButton buttonText={"Remove Story Point"}/>
        </>
    )
}