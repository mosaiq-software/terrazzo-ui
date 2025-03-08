import React, { useEffect, useState } from "react";
import ListElement from "@trz/components/ListElement"
import {CSS, Transform} from '@dnd-kit/utilities';
import {useSortable} from '@dnd-kit/sortable';
import { List } from "@mosaiq/terrazzo-common/types";
import { useSocket } from "@trz/contexts/socket-context";
import { useDroppable } from "@dnd-kit/core";


interface SortableListProps {
    listType: List;
    children?: React.ReactNode;
    index: number;
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
        id: props.listType.id,
        data: { type: "list" },
    });

    const {
        setNodeRef: droppableSetNodeRef
    } = useDroppable({
        id: props.listType.id
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
            x: otherDraggingPos.x - initialPosition.x - (initialPosition.width / 2),
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
                listType={props.listType}
                dragging={isDragging || !!otherDraggingPos}
                handleProps={{ref: setActivatorNodeRef, ...listeners, ...attributes}}
                droppableSetNodeRef={droppableSetNodeRef}
                isOverlay={!!otherDraggingPos}
            >
                {props.children}
            </ListElement>
        </div>
    );
}
export default SortableList;