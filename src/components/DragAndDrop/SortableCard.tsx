import React, { useEffect, useState } from "react";
import ListElement from "@trz/components/ListElement"
import {CSS, Transform} from '@dnd-kit/utilities';
import {AnimateLayoutChanges, defaultAnimateLayoutChanges, useSortable} from '@dnd-kit/sortable';
import { Card } from "@mosaiq/terrazzo-common/types";
import { useSocket } from "@trz/util/socket-context";
import CardElement from "../CardElement";


interface SortableCardProps {
	cardType: Card;
    disabled: boolean;
}

function SortableCard(props: SortableCardProps): React.JSX.Element {
    const sockCtx = useSocket();
    const [initialPosition, setInitialPosition] = useState<DOMRect | undefined>(undefined);

    const {
        active,
        attributes,
        isDragging,
        listeners,
        over,
        setNodeRef,
        transition,
        transform,
        node,
    } = useSortable({
        id: props.cardType.id,
        data: {
            type: 'card',
        },
    });

    useEffect(()=>{
        if(node.current){
            setInitialPosition(node.current.getBoundingClientRect())
        }
    }, [node])

    const otherDraggingPos = sockCtx.roomUsers.find((ru)=>ru.mouseRoomData?.draggingCard === props.cardType.id)?.mouseRoomData?.pos
    let cardTransform: Transform  | null = transform
    if(cardTransform) {
        cardTransform.scaleY = 1;
    } else if(otherDraggingPos && initialPosition){
        cardTransform = {
            x: otherDraggingPos.x - initialPosition.x - (initialPosition.width / 2),
            y: otherDraggingPos.y - initialPosition.y - (initialPosition.height / 2),
            scaleX: 1,
            scaleY: 1
        };
    }
    return (
        <div
            ref={props.disabled ? undefined : setNodeRef} 
            {...attributes} 
            {...listeners}
            style={{
                zIndex: isDragging ? 101 : undefined,
            }}
        >
            <CardElement cardType={props.cardType} dragging={isDragging} isOverlay={false}/>
        </div>
    );
}
export default SortableCard;