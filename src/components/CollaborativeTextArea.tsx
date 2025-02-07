import React, {useCallback, useEffect, useRef, useState} from "react";
import {useSocket} from "@trz/util/socket-context";
import { Box, Textarea } from "@mantine/core";
import { useClickOutside } from '@mantine/hooks';
import { getCaretCoordinates } from "@trz/util/textUtils";

interface CollaborativeTextAreaProps {
    maxLineLength: number;
    fontSize?: number;
    maxRows?: number;
}

export const CollaborativeTextArea = (props: CollaborativeTextAreaProps) => {
    const sockCtx = useSocket();
    const [testText, setTestText] = useState("");
    const [caret, setCaret] = useState<{x:number, y:number}|undefined>(undefined);
    useClickOutside(()=>setCaret(undefined));
    const textRef = useRef<any>();

    useEffect(()=>{
        updateTextArea();
    },[])

    const updateTextArea =  () => {
        const element = textRef.current;
        if(!element){ return; }
        element.style.height = "";
        element.style.height = (element.scrollHeight+(1.5*(props.fontSize??16)))+'px'; 
        updateCaret();
    }

    const updateCaret = async () => {
        await new Promise((resolve)=>setTimeout(resolve,0))
        const element = textRef.current;
        if(!element){ return; }
        const coordinates = getCaretCoordinates(element, element.selectionStart);
        setCaret({x: coordinates.left, y:coordinates.top});
    }


    return (
        <div style={{
            width: "fit-content",
            position: "relative"
        }}>
            
            <div style={{clear:"both"}}></div>
            <textarea 
                ref={textRef}
                value={testText}
                onChange={(e)=>{
                    setTestText(e.target.value);
                }}
                dir="ltr" 
                id="COLLAB_TEXTAREA"
                className="collabta"
                onMouseDown={updateTextArea}
                onKeyUp={updateTextArea}
                onKeyDown={updateTextArea}
                onPaste={updateTextArea}
                onBeforeInput={updateTextArea}
                onBlur={()=>setCaret(undefined)}
                style={{
                    fontFamily: "monospace",
                    fontSize: props.fontSize ?? 16,
                    color: "transparent",
                    textShadow: "0px 0px 0px black",
                    resize: "none",
                    position: "absolute"
                }}
                wrap={"soft"}
                cols={props.maxLineLength}
            />
            <div
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    top: 0,
                    left: 0,
                }}
            >
                {
                    caret &&
                    <UserCursor 
                        color="red"
                        x={caret.x}
                        y={caret.y}
                    />
                }

            </div>
        </div>
    )
}

interface UserCursorProps {
    color: string;
    x: number;
    y: number;
}
const UserCursor = (props: UserCursorProps) => {
    return (
        <Box
            pos="absolute"
            top={props.y+2}
            left={props.x}
            w="2px"
            h="1lh"
            bg={props.color}
            display="inline-block"
            style={{
                height: '100%',
                lineHeight: "1",
                fontFamily: 'monospace',
                zIndex: 10
            }}
        />
    )
}