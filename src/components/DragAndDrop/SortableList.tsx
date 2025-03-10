import React, { useEffect, useState } from "react";
import ListElement from "@trz/components/ListElement"
import {CSS, Transform} from '@dnd-kit/utilities';
import {useSortable} from '@dnd-kit/sortable';
import { Card, CardId, ListId } from "@mosaiq/terrazzo-common/types";
import { useSocket } from "@trz/contexts/socket-context";
import { useDroppable } from "@dnd-kit/core";
import { useInViewport } from "@mantine/hooks";


interface SortableListProps {
    listId: ListId;
    onClickCard: (card:CardId)=>void;
    boardCode: string;
}
function SortableList(props: SortableListProps): React.JSX.Element {
    const sockCtx = useSocket();
    const [initialPosition, setInitialPosition] = useState<DOMRect | undefined>(undefined);
    
    const {
        attributes,
        isDragging,
        listeners,
        setNodeRef: sortableSetNodeRef,
        transition,
        transform,
        node,
        setActivatorNodeRef
    } = useSortable({
        id: props.listId,
        data: { type: "list" },
    });

    const {
        setNodeRef: droppableSetNodeRef
    } = useDroppable({
        id: props.listId
    })

    useEffect(()=>{
        if(node.current){
            setInitialPosition(node.current.getBoundingClientRect());
        }
    }, [node])

    const otherDraggingPos = null;//sockCtx.roomUsers.find((ru)=>ru.mouseRoomData?.draggingList === props.listType.id)?.mouseRoomData?.pos;
    let listTransform: Transform  | null = transform
    if(listTransform) {
        listTransform.scaleY = 1;
    } else if(otherDraggingPos && initialPosition){
        listTransform = {
            x: 0,//otherDraggingPos.x - initialPosition.x - (initialPosition.width / 2),
            y: 0,
            scaleX: 1,
            scaleY: 1
        };
    }

    return (
        <div
            ref={sortableSetNodeRef} 
            style={{
                transform: CSS.Transform.toString(listTransform),
                transition: transition,
                zIndex: (isDragging || !!otherDraggingPos) ? 100 : undefined,
            }}
        >
            <ListElement
                listId={props.listId}
                dragging={isDragging || !!otherDraggingPos}
                handleProps={{ref: setActivatorNodeRef, ...listeners, ...attributes}}
                droppableSetNodeRef={droppableSetNodeRef}
                isOverlay={!!otherDraggingPos}
                onClickCard={props.onClickCard}
                boardCode={props.boardCode}
            />
        </div>
    );
}
export default SortableList;