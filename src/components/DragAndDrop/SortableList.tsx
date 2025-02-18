import React, { useEffect, useState } from "react";
import ListElement from "@trz/components/ListElement"
import {CSS, Transform} from '@dnd-kit/utilities';
import {AnimateLayoutChanges, defaultAnimateLayoutChanges, useSortable} from '@dnd-kit/sortable';
import { List } from "@mosaiq/terrazzo-common/types";
import { useSocket } from "@trz/util/socket-context";


interface SortableListProps {
    listType: List;
    children?: React.ReactNode;
}

const animateLayoutChanges: AnimateLayoutChanges = (args) => defaultAnimateLayoutChanges({ ...args, wasDragging: true });

function SortableList(props: SortableListProps): React.JSX.Element {
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
        id:props.listType.id,
        data: {
        type: 'container',
        children: props.listType.cards,
        },
        animateLayoutChanges,
    });

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
    return (
        <div
            ref={setNodeRef} 
            {...attributes} 
            {...listeners}
            style={{
                transform: CSS.Transform.toString(listTransform),
                zIndex: isDragging ? 1000 : "unset"
            }}
        >
            <ListElement listType={props.listType}>
                {props.children}
            </ListElement>
        </div>
    );
}
export default SortableList;