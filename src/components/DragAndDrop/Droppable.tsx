import React, { CSSProperties, useState } from "react";

interface DroppableProps {
    children?: React.ReactNode;
    style?: CSSProperties;
    id: number;
    group: string;
    onDragHover?: (id:number, group:string) => void;
    onDragDrop?: (id:number, group:string) => void;
}
const Droppable = (props: DroppableProps) => {
    return (
        <div
            onDragOver={(e)=>{
                e.preventDefault();
            }}
            onDragEnterCapture={()=>{
                const {id, group} = global.trzDragging;
                if(props.onDragHover)
                    props.onDragHover(id, group);
            }}
            onDragEnd={(e)=>{
                e.preventDefault();
                const {id, group} = global.trzDragging;
                if(props.onDragDrop)
                    props.onDragDrop(id, group);
            }}
            onDrop={(e)=>{
                e.preventDefault();
                const {id, group} = global.trzDragging;
                if(props.onDragDrop)
                    props.onDragDrop(id, group);
            }}
            style={props.style}
        >
            {props.children}
        </div>
    )
}

export default Droppable;