import React, {KeyboardEventHandler, useCallback, useEffect, useRef, useState} from "react";
import {useSocket} from "@trz/util/socket-context";
import { useClickOutside, useElementSize  } from '@mantine/hooks';
import { getCaretCoordinates } from "@trz/util/textUtils";
import { TextBlockEvent, TextBlockId } from "@mosaiq/terrazzo-common/types";
import {UserCaret} from '@trz/components/UserCaret';
import { C } from "react-router/dist/production/fog-of-war-CbNQuoo8";
import { executeTextBlockEvent } from "@mosaiq/terrazzo-common/utils/textUtils";

interface CollaborativeTextAreaProps {
    maxLineLength: number;
    textBlockId: TextBlockId;
    fontSize?: number;
    maxRows?: number;
}

export const CollaborativeTextArea = (props: CollaborativeTextAreaProps) => {
    const sockCtx = useSocket();
    const [caret, setCaret] = useState<{x:number, y:number}|undefined>(undefined);
    useClickOutside(()=>setCaret(undefined));
    const textRef = useRef<any>();
    const { ref, width, height } = useElementSize();

    useEffect(() => {

        const initialize = async () => {
            if (!sockCtx.connected) { return; }

            const textBlock = await sockCtx.getTextBlockData(props.textBlockId);
            sockCtx.setCollaborativeText(textBlock?.text);
            sockCtx.setRoom("text-"+props.textBlockId);
        }

        initialize();
        
        return () => {
            sockCtx.setRoom(null);
            sockCtx.setCollaborativeText(undefined);
        }
    }, [sockCtx.connected, props.textBlockId]);

    useEffect(()=>{
        resizeTextArea();
    }, [textRef.current, sockCtx.collaborativeText])

    const resizeTextArea = () => {
        const element = textRef.current;
        if(!element){ return; }
        element.style.height = "";
        element.style.height = (element.scrollHeight+(2*(props.fontSize??16)))+'px'; 
    }

    const updateCaret = async () => {
        await new Promise((resolve)=>setTimeout(resolve,0))
        const element = textRef.current;
        if(!element){ return; }
        const coordinates = getCaretCoordinates(element, element.selectionStart);
        const relativeCoords = {x: coordinates.left/width, y: coordinates.top/height}
        setCaret(relativeCoords);
        sockCtx.updateCaret(relativeCoords);
    }

    const setCombinedRefs = (element) => {
        (ref.current as any) = element;
        textRef.current = element;
    }

    const onPaste = (e) => {
        updateCaret();
    }
    
    const onKeypress = (e) => {
        const tbEvent: TextBlockEvent = {
            id: props.textBlockId,
            start: textRef.current.selectionStart,
            end: textRef.current.selectionEnd,
            inserted: e.key,
        };
        const updated = executeTextBlockEvent(sockCtx.collaborativeText ?? '', tbEvent);
        sockCtx.setCollaborativeText(updated);
        sockCtx.updateTextBlock(tbEvent);
        updateCaret();
    }

    return (
        <div style={{
            width: "fit-content",
            position: "relative"
        }}>
            
            <div style={{clear:"both"}}></div>
            <textarea 
                ref={setCombinedRefs}
                value={sockCtx.collaborativeText}
                dir="ltr" 
                id="COLLAB_TEXTAREA"
                className="collabta"
                onPasteCapture={(e)=>onPaste(e)}
                onKeyDown={(e)=>onKeypress(e)}
                onBlur={()=>setCaret(undefined)}
                onMouseDown={updateCaret}
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
                    caret && <UserCaret x={caret.x*width} y={caret.y*height} idle={false} color={"black"} />
                }
                {
                    sockCtx.roomUsers.map((user)=>{
                        if(!user || !user.textRoomData){ return null; }
                        return (
                            <UserCaret 
                                x={user.textRoomData.caret.x*width}
                                y={user.textRoomData.caret.y*height}
                                idle={user.idle}
                                avatarUrl={user.avatarUrl}
                                name={user.fullName}
                            />
                        );
                    })
                }

            </div>
        </div>
    )
}