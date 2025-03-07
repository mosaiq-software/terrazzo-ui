import React, {useEffect, useRef, useState} from "react";
import {useSocket} from "@trz/contexts/socket-context";
import { useClickOutside, useElementSize, useClipboard } from '@mantine/hooks';
import { interceptPaste, TAB_CHAR } from "@trz/util/textUtils";
import { TextBlockEvent, TextBlockId } from "@mosaiq/terrazzo-common/types";
import {UserCaret} from '@trz/components/UserCaret';
import { Position, RoomType } from "@mosaiq/terrazzo-common/socketTypes";
import { getRoomCode } from "@mosaiq/terrazzo-common/utils/socketUtils";
import { NoteType, notify } from "@trz/util/notifications";

interface CollaborativeTextAreaProps {
    maxLineLength: number;
    textBlockId: TextBlockId;
    fontSize?: number;
    showOwnCursorAsCustom?: boolean; // should the cursor be a custom one (T) or the default browser one (F/u).
    textColor: string;
    backgroundColor: string;
    onClose?: ()=>void;
}

export const CollaborativeTextArea = (props: CollaborativeTextAreaProps) => {
    const sockCtx = useSocket();
    const textRef = useRef<any>();
    const clipboard = useClipboard();
    const [textAreaSize, setTextAreaSize] = useState<Position>({x:0, y:0});

    useEffect(() => {
        const initialize = async () => {
            if (!sockCtx.connected) { return; }
            sockCtx.setRoom(getRoomCode(RoomType.TEXT, props.textBlockId));
        }
        initialize();
    }, [sockCtx.connected, props.textBlockId]);

    useEffect(()=>{
        resizeTextArea();
    }, [textRef.current, sockCtx.collaborativeTextObject.text])

    const resizeTextArea = () => {
        const element = textRef.current;
        if(!element){ return; }
        element.style.height = "";
        element.style.height = (element.scrollHeight+(2*(props.fontSize??16)))+'px';
        const width = element.getBoundingClientRect().width;
        const height = element.getBoundingClientRect().height;
        setTextAreaSize({x:width, y:height});
    }

    const handleTextEvent = (event: TextBlockEvent) => {
        sockCtx.receiveCollabTextEvent(event, textRef.current, true);
    }

    const onBlur = () => {
        if(!textRef.current){
            return;
        }
        textRef.current.selectionStart = undefined;
        textRef.current.selectionEnd = undefined;
        sockCtx.syncCaretPosition(textRef.current);
        if(props.onClose){props.onClose();}
    }

    const onCut = (e: ClipboardEvent) => {
        if(!sockCtx.collaborativeTextObject?.text) {return;}
        const tbEvent: TextBlockEvent = {
            id: props.textBlockId,
            start: textRef.current.selectionStart,
            end: textRef.current.selectionEnd,
            inserted: '',
        };
        const text = sockCtx.collaborativeTextObject.text.substring(Math.min(tbEvent.start, tbEvent.end), Math.max(tbEvent.start, tbEvent.end));
        clipboard.copy(text);
        handleTextEvent(tbEvent);
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
        handleTextEvent(tbEvent);
    }
    
    const onKeypress = (e:KeyboardEvent) => {
        if (e.ctrlKey || e.metaKey || e.altKey) {
            e.preventDefault();
            switch (e.key){
                case 's':
                    notify(NoteType.ACK_AUTOSAVE)
                    break;
                case 'Enter':
                    if(props.onClose){
                        props.onClose();
                    }
                    break;
            }
            return;
        }
        const tbEvent: TextBlockEvent = {
            id: props.textBlockId,
            start: textRef.current.selectionStart,
            end: textRef.current.selectionEnd,
            inserted: '',
        };
        
        if(sockCtx.collaborativeTextObject.caret !== undefined && tbEvent.start !== sockCtx.collaborativeTextObject.caret && tbEvent.start === tbEvent.end){
            tbEvent.start = sockCtx.collaborativeTextObject.caret;
            tbEvent.end = sockCtx.collaborativeTextObject.caret;
        }

        switch (e.key) {
            case 'Delete':
                e.preventDefault();
                if (tbEvent.start === tbEvent.end)
                    tbEvent.end++;
                handleTextEvent(tbEvent);
                return;
            case 'Backspace':
                e.preventDefault();
                if (tbEvent.start === tbEvent.end)
                    tbEvent.start--;
                handleTextEvent(tbEvent);
                return;
            case 'Enter':
                case 'Return':
                    e.preventDefault();
                    tbEvent.inserted = '\n';
                    handleTextEvent(tbEvent);
                    return;
            case 'Tab':
                e.preventDefault();
                tbEvent.inserted = TAB_CHAR;
                handleTextEvent(tbEvent);
                return;
            case 'Escape':
                if(props.onClose){
                    props.onClose();
                }
                break;
            default:
                if (e.key.length === 1) {
                    e.preventDefault();
                    tbEvent.inserted = e.key;
                    handleTextEvent(tbEvent);
                    return;
                } else {
                    sockCtx.syncCaretPosition(textRef.current);
                }
        }
    }

    useClickOutside(onBlur);
    
    return (
        <div style={{
            position: "relative",
            width: textAreaSize.x,
            height: textAreaSize.y,
        }}>
            <div style={{clear:"both"}}></div>
            <textarea 
                ref={textRef}
                autoFocus
                value={sockCtx.collaborativeTextObject?.text ?? ''}
                dir="ltr" 
                id="COLLAB_TEXTAREA"
                className="collabta"
                onKeyDown={(e) => onKeypress(e as any)}
                onMouseDown={(e) => {sockCtx.syncCaretPosition(textRef.current);}}
                onCut={(e) => onCut(e as any)}
                onPaste={(e) => onPaste(e as any)}
                onBlur={onBlur}
                onChange={()=>{}}
                style={{
                    fontSize: props.fontSize ?? 16,
                    resize: "none",
                    position: "absolute",
                    width: (props.maxLineLength)+"ch",
                    color: props.showOwnCursorAsCustom ? "transparent" : props.textColor,
                    textShadow: props.showOwnCursorAsCustom ? "0px 0px 0px " + props.textColor : 'none',
                    backgroundColor: props.backgroundColor,
                    border: "2px solid #ccc",
                    borderRadius: "5px",
                }}
                wrap={"soft"}
            />
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                }}
            >
                {
                    props.showOwnCursorAsCustom && 
                    sockCtx.collaborativeTextObject.relative && 
                    <UserCaret
                        x={sockCtx.collaborativeTextObject.relative.x*textAreaSize.x}
                        y={sockCtx.collaborativeTextObject.relative.y*textAreaSize.y}
                        idle={false}
                        color={"black"}
                    />
                }
                {
                    sockCtx.roomUsers.map((user, i)=>{
                        if(!user?.textRoomData?.caret ){ return null; }
                        return (
                            <UserCaret
                                key={'usercaret'+i}
                                x={user.textRoomData.caret.x*textAreaSize.x}
                                y={user.textRoomData.caret.y*textAreaSize.y}
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