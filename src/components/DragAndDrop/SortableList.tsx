import React, { useEffect, useRef, useState } from "react";
import ListElement from "@trz/components/ListElement"
import {CSS, Transform} from '@dnd-kit/utilities';
import {AnimateLayoutChanges, defaultAnimateLayoutChanges, useSortable} from '@dnd-kit/sortable';
import { List } from "@mosaiq/terrazzo-common/types";
import { useSocket } from "@trz/util/socket-context";
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
        active,
        attributes,
        isDragging,
        listeners,
        over,
        setNodeRef: sortableSetNodeRef,
        transition,
        transform,
        node,
        setActivatorNodeRef
    } = useSortable({
        id: props.listType.id,
        data: {
            type: "list"
        }
    });

    const {
        setNodeRef: droppableSetNodeRef
    } = useDroppable({
        id: props.listType.id
    })

    useEffect(()=>{
        if(node.current)
            setInitialPosition(node.current.getBoundingClientRect())
    }, [node])

    const otherDraggingPos = sockCtx.roomUsers.find((ru)=>ru.mouseRoomData?.draggingList === props.listType.id)?.mouseRoomData?.pos
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

    console.log("List: "+props.listType.id.substring(0,2),"is at index", props.index, "with an x of", node.current?.getBoundingClientRect().x.toFixed(0), "but going to", listTransform?.x,)
    return (
        <div
            ref={sortableSetNodeRef} 
            style={{
                transform: CSS.Transform.toString(listTransform),
                transition,
                // opacity: isDragging ? 0 : 1,
            }}
        >
            <ListElement
                listType={props.listType}
                dragging={isDragging}
                handleProps={{ref: setActivatorNodeRef, ...listeners, ...attributes}}
                droppableSetNodeRef={droppableSetNodeRef}
                index={props.index}
            >
                {props.children}
            </ListElement>
        </div>
    );
}
export default SortableList;