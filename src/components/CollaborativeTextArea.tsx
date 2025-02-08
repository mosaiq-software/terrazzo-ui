import React, {KeyboardEventHandler, useCallback, useEffect, useRef, useState} from "react";
import {useSocket} from "@trz/util/socket-context";
import { useClickOutside, useElementSize, useClipboard } from '@mantine/hooks';
import { getCaretCoordinates, interceptPaste, TAB_CHAR } from "@trz/util/textUtils";
import { TextBlockEvent, TextBlockId } from "@mosaiq/terrazzo-common/types";
import {UserCaret} from '@trz/components/UserCaret';
import { executeTextBlockEvent } from "@mosaiq/terrazzo-common/utils/textUtils";
import { Position } from "@mosaiq/terrazzo-common/socketTypes";

interface CollaborativeTextAreaProps {
    maxLineLength: number;
    textBlockId: TextBlockId;
    fontSize?: number;
    maxRows?: number;
}

export const CollaborativeTextArea = (props: CollaborativeTextAreaProps) => {
    const sockCtx = useSocket();
    const textRef = useRef<any>();
    const [textCaret, setTextCaret] = useState<Position | undefined>(undefined);
    const { ref, width, height } = useElementSize();
    const clipboard = useClipboard();

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

    const updateCaret = async (selectionStart?: number) => {
        await new Promise((resolve)=>setTimeout(resolve,0))
        const element = textRef.current as HTMLTextAreaElement;
        if(!element){ return; }
        if(selectionStart !== undefined) {
            element.selectionStart = selectionStart;
            element.selectionEnd = selectionStart;
        }
        const coordinates = getCaretCoordinates(element, element.selectionStart);
        const relativeCoords = {x: coordinates.left/width, y: coordinates.top/height}
        sockCtx.updateCaret(relativeCoords, selectionStart ?? element.selectionStart);
        setTextCaret(relativeCoords);
    }

    const setCombinedRefs = (element) => {
        (ref.current as any) = element;
        textRef.current = element;
    }

    const onBlur = () => {
        sockCtx.updateCaret(undefined, undefined);
    }

    const emitTextEvent = (event: TextBlockEvent) => {
        const {updated, selectionStart} = executeTextBlockEvent(sockCtx.collaborativeText ?? '', event, sockCtx.collabCaretSelStart);
        sockCtx.setCollaborativeText(updated);
        sockCtx.updateTextBlock(event);
        updateCaret(sockCtx.collabCaretSelStart ? selectionStart : undefined);
    }

    const onCut = (e: ClipboardEvent) => {
        if(!sockCtx.collaborativeText) {return;}
        const tbEvent: TextBlockEvent = {
            id: props.textBlockId,
            start: textRef.current.selectionStart,
            end: textRef.current.selectionEnd,
            inserted: '',
        };
        const text = sockCtx.collaborativeText.substring(Math.min(tbEvent.start, tbEvent.end), Math.max(tbEvent.start, tbEvent.end));
        clipboard.copy(text);
        emitTextEvent(tbEvent);
    }

    const onPaste = (e: ClipboardEvent) => {
        const clip = interceptPaste(e);
        if(!clip) {
            return;
        }
        const tbEvent: TextBlockEvent = {
            id: props.textBlockId,
            start: textRef.current.selectionStart,
            end: textRef.current.selectionEnd,
            inserted: clip,
        };
        emitTextEvent(tbEvent);
    }
    
    const onKeypress = (e:KeyboardEvent) => {
        if (e.ctrlKey || e.metaKey || e.altKey) {
            return;
        }

        const tbEvent: TextBlockEvent = {
            id: props.textBlockId,
            start: textRef.current.selectionStart,
            end: textRef.current.selectionEnd,
            inserted: '',
        };

        switch (e.key) {
            case 'Delete':
                e.preventDefault();
                if (tbEvent.start === tbEvent.end)
                    tbEvent.end++;
                emitTextEvent(tbEvent);
                return;
            case 'Backspace':
                e.preventDefault();
                if (tbEvent.start === tbEvent.end)
                    tbEvent.start--;
                emitTextEvent(tbEvent);
                return;
            case 'Enter':
                case 'Return':
                    e.preventDefault();
                    tbEvent.inserted = '\n';
                    emitTextEvent(tbEvent);
                    return;
            case 'Tab':
                e.preventDefault();
                tbEvent.inserted = TAB_CHAR;
                emitTextEvent(tbEvent);
                return;
            default:
                if (e.key.length === 1) {
                    e.preventDefault();
                    tbEvent.inserted = e.key;
                    emitTextEvent(tbEvent);
                }
        }

        updateCaret();

    }

    useClickOutside(onBlur);

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
                onKeyDown={(e) => onKeypress(e as any)}
                onMouseDown={(e) => updateCaret()}
                onCut={(e) => onCut(e as any)}
                onPaste={(e) => onPaste(e as any)}
                onBlur={onBlur}
                style={{
                    fontFamily: "monospace",
                    fontSize: props.fontSize ?? 16,
                    // color: "transparent",
                    // textShadow: "0px 0px 0px black",
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
                    // textCaret && <UserCaret x={textCaret.x*width} y={textCaret.y*height} idle={false} color={"black"} />
                }
                {
                    sockCtx.roomUsers.map((user, i)=>{
                        if(!user?.textRoomData?.caret ){ return null; }
                        return (
                            <UserCaret
                                key={'usercaret'+i}
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