import React, { useState } from "react";

interface DraggableProps {
    removeOnDrag?: boolean;
    children: React.ReactNode;
    id: number;
    group: string;
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
                global.trzDragging = {id: props.id, group:props.group};
            }}
            onDragEndCapture={(e)=>{
                e.preventDefault();
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