import React, { useEffect, useState } from "react";
import {CSS, Transform} from '@dnd-kit/utilities';
import {useSortable} from '@dnd-kit/sortable';
import { Card } from "@mosaiq/terrazzo-common/types";
import { useSocket } from "@trz/util/socket-context";
import CardElement from "../CardElement";
import { createPortal } from "react-dom";

interface SortableCardProps {
	cardType: Card;
    disabled: boolean;
    boardCode: string;
}
function SortableCard(props: SortableCardProps): React.JSX.Element {
    const sockCtx = useSocket();
    const [initialPosition, setInitialPosition] = useState<DOMRect | undefined>(undefined);

    const {
        attributes,
        isDragging,
        listeners,
        setNodeRef,
        transform,
        node,
    } = useSortable({
        id: props.cardType.id,
        data: { type: 'card' },
    });

    useEffect(()=>{
        if(node.current){
            setInitialPosition(node.current.getBoundingClientRect());
        }
    }, [node])

    const otherDraggingPos = sockCtx.roomUsers.find((ru)=>ru.mouseRoomData?.draggingCard === props.cardType.id)?.mouseRoomData?.pos;
    if(!!otherDraggingPos && initialPosition) {
        return createPortal(
            <div style={{
                position: 'absolute',
                left: otherDraggingPos.x,
                top: otherDraggingPos.y,
                zIndex: 101,
            }}>
                <CardElement cardType={props.cardType} dragging={true} isOverlay={true} boardCode={props.boardCode}/>
            </div>,
            document.body
        );
    }

    return (
        <div
            ref={props.disabled ? undefined : setNodeRef} 
            {...attributes} 
            {...listeners}
            style={{
                transform: transform ? CSS.Transform.toString({...transform, scaleY: 1, scaleX: 1}) : undefined,
                zIndex: isDragging ? 101 : undefined,
            }}
        >
            <CardElement cardType={props.cardType} dragging={isDragging} isOverlay={false} boardCode={props.boardCode}/>
        </div>
    );
}
export default SortableCard;