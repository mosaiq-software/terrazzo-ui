import React, { useState } from "react";

interface DraggableProps {
    removeOnDrag?: boolean;
    children: React.ReactNode;
    id: string;
    group: string;
    onDrag?: (id:string)=>void;
    onDrop?: (id:string)=>void;
}
const Draggable = (props: DraggableProps) => {
    const [dragging, setDragging] = useState<boolean>(false);
    
    return (
        <div
            draggable
            onDragCapture={(e)=>{
                e.preventDefault();
                setDragging(true);
            }}
            onDragStartCapture={(e)=>{
                // e.preventDefault();
                if(props.onDrag)
                    props.onDrag(props.id);
                global.trzDragging = {id: props.id, group:props.group};
            }}
            onDragEndCapture={(e)=>{
                e.preventDefault();
                if(props.onDrop)
                    props.onDrop(props.id);
                setDragging(false)
            }}
            style={{
                userSelect: "none",
                opacity: dragging ? props.removeOnDrag ? 0 : .35 : 1,
                cursor: dragging ? "grabbing" : "grab",
            }}
        >
            {props.children}
        </div>
    )
}

export default Draggable;