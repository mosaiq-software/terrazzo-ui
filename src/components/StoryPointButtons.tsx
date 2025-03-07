import React from "react";
import {Menu} from "@mantine/core"
import {StoryPoints} from "@mosaiq/terrazzo-common/constants";
import {useSocket} from "@trz/contexts/socket-context";
import {useTRZ} from "@trz/contexts/TRZ-context";
import {NoteType, notify} from "@trz/util/notifications";
import { CardId } from "@mosaiq/terrazzo-common/types";

interface StoryPointProps{
    buttonText: string;
    cardId: CardId;
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

        if(!props.cardId){
            notify(NoteType.CARD_UPDATE_ERROR);
            return;
        }
        try{
            console.log("this is the story" + storyPoint);
            await sockCtx.updateCardField(props.cardId, {storyPoints: storyPoint});
        }catch (e){
            notify(NoteType.CARD_UPDATE_ERROR);
            return;
        }
    }

    return (
            <Menu.Item bg='gray' ta='center' c='white' onClick={onClick}>{props.buttonText}</Menu.Item>
    )
}

interface StoryPointButtonsProps {
    cardId: CardId;
}
export const StoryPointButtons =  (props: StoryPointButtonsProps):React.JSX.Element => {
    const storyPointsArray = Object.values(StoryPoints).filter(value => typeof value === 'number');

    return(
        <>
            {storyPointsArray.map((point, index) => (
                <StoryPointButton buttonText={`${point}`} key={index} cardId={props.cardId} />
            ))}
            <StoryPointButton buttonText={"Remove Story Point"} cardId={props.cardId}/>
        </>
    )
}