import React, {useEffect, useRef, useState} from "react";
import {useSocket} from "@trz/contexts/socket-context";
import { useClickOutside, useClipboard, useThrottledCallback } from '@mantine/hooks';
import { getCaretCoordinates, interceptPaste, TAB_CHAR, TEXT_EVENT_EMIT_THROTTLE_MS, TextObject } from "@trz/util/textUtils";
import { TextBlockEvent, TextBlockId} from "@mosaiq/terrazzo-common/types";
import {UserCaret} from '@trz/components/UserCaret';
import { Position, RoomType, ServerSE } from "@mosaiq/terrazzo-common/socketTypes";
import { NoteType, notify } from "@trz/util/notifications";
import { useRoom } from "@trz/hooks/useRoom";
import {
  executeTextBlockEvent,
  fullName,
} from "@mosaiq/terrazzo-common/utils/textUtils";
import {
  emitTextBlockEvents,
  initializeTextBlockData,
  syncUpdatedCaret,
} from "@trz/emitters/text";
import { useSocketListener } from "@trz/hooks/useSocketListener";
import { Box, Button, Text } from "@mantine/core";
import { MarkdownTextarea } from "./MarkdownTextarea";

interface CollaborativeTextAreaProps {
    maxLineLength: number;
    textBlockId: TextBlockId;
    fontSize?: number;
    showOwnCursorAsCustom?: boolean; // should the cursor be a custom one (T) or the default browser one (F/u).
    textColor: string;
    backgroundColor: string;
    markdown?: boolean;
    placeholder: string;
}

export const CollaborativeTextArea = (props: CollaborativeTextAreaProps) => {
    const sockCtx = useSocket();
    const textRef = useRef<HTMLTextAreaElement>();
    const clipboard = useClipboard();
    const [textAreaSize, setTextAreaSize] = useState<Position>({x:0, y:0});
    const [roomUsers, setRoomUsers] = useRoom(RoomType.TEXT, props.textBlockId, true);
    const [collaborativeTextObject, setCollaborativeTextObject] = useState<TextObject>({text: '', caret: undefined, relative: undefined, queue:[]});
    const [editingMode, setEditingModeState] = useState<boolean>(false);
    const setEditingMode = (editing:boolean) => {
        if(!editing){
            syncUpdatedCaret(sockCtx, undefined);
        }
        setEditingModeState(editing);
    }

    useEffect(()=>{
        initializeTextBlockData(sockCtx, props.textBlockId)
        .then((text)=>{
            setCollaborativeTextObject({ text: text?.text ?? '', caret: undefined, relative: undefined, queue: [] });
        })
    }, [sockCtx.connected])

    useEffect(()=>{
        resizeTextArea();
    }, [textRef.current, collaborativeTextObject.text, editingMode])


    useSocketListener<ServerSE.UPDATE_TEXT_BLOCK>(ServerSE.UPDATE_TEXT_BLOCK, (payload)=>{
        if (!payload) {
            return;
        }
        for (const event of payload.events){
            receiveCollabTextEvent(event, undefined, false);
        }
    });

    useSocketListener<ServerSE.TEXT_CARET>(ServerSE.TEXT_CARET, (payload)=>{
        const user = roomUsers.get(payload.sid);
        if(user){
            roomUsers.set(payload.sid, {
                ...user,
                textRoomData: {caret: payload.caret}
            });
        }
    });
    

    // HELPERS
    const receiveCollabTextEvent = (event: TextBlockEvent, element: HTMLTextAreaElement | undefined, emit: boolean) => {
        setCollaborativeTextObject((prev)=>{
            const {updated, selectionStart} = executeTextBlockEvent(prev.text, event, prev.caret);
            const updatedTextObject = {
                text: updated,
                caret: selectionStart,
                relative: prev.relative,
                queue: [...prev.queue, event],
            };
            const tick = async ()=>{
                await new Promise((resolve)=>setTimeout(resolve, 0));
                throttledEmitTextEvents();
            }
            if(emit){
                tick();
            }
            return updatedTextObject;
        });
        updateCaretPosition(element, true);
    }

    const updateCaretPosition = async (element: HTMLTextAreaElement | undefined, useKnownPosition?: boolean): Promise<void> => {
        await new Promise((resolve)=>setTimeout(resolve, 0));
        if(!element){ 
            return;
        }
        setCollaborativeTextObject((prev)=>{
            if(prev.caret !== undefined && useKnownPosition) {
                element.selectionStart = prev.caret;
                element.selectionEnd = prev.caret;
            }
            const width = element.getBoundingClientRect().width;
            const height = element.getBoundingClientRect().height;
            const coordinates = getCaretCoordinates(element, element.selectionStart);
            const relativeCoords = {x: coordinates.left/width, y: coordinates.top/height}

            const a = {
                ...prev,
                caret: element.selectionStart,
                relative: relativeCoords,
            };
            syncUpdatedCaret(sockCtx, relativeCoords);
            return a;
        });
    }

    const throttledEmitTextEvents = useThrottledCallback(()=>{
        emitTextBlockEvents(sockCtx, collaborativeTextObject.queue);
        setCollaborativeTextObject((prev) => {
            return {
                ...prev,
                queue: []
            }
        });
    }, TEXT_EVENT_EMIT_THROTTLE_MS);


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
        receiveCollabTextEvent(event, textRef.current, true);
    }

    const onBlur = () => {
        if(!textRef.current){
            return;
        }
        textRef.current.blur();
        updateCaretPosition(textRef.current);
    }

    const onCut = (e: ClipboardEvent) => {
        if(!collaborativeTextObject.text) {return;}
        const tbEvent: TextBlockEvent = {
            id: props.textBlockId,
            start: textRef.current?.selectionStart ?? 0,
            end: textRef.current?.selectionEnd ?? 0,
            inserted: '',
        };
        const text = collaborativeTextObject.text.substring(Math.min(tbEvent.start, tbEvent.end), Math.max(tbEvent.start, tbEvent.end));
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
            start: textRef.current?.selectionStart ?? 0,
            end: textRef.current?.selectionEnd ?? 0,
            inserted: clip,
        };
        handleTextEvent(tbEvent);
    }

    const onSelectAll = () => {
        if(!textRef.current){
            return;
        }
        textRef.current.selectionStart = 0;
        textRef.current.selectionEnd = textRef.current.textLength;
    }
    
    const onKeypress = (e:KeyboardEvent) => {
        if (e.ctrlKey || e.metaKey || e.altKey) {
            e.preventDefault();
            switch (e.key){
                case 's':
                    notify(NoteType.ACK_AUTOSAVE)
                    break;
                case 'a':
                    onSelectAll();
                    break;
                case 'Enter':
                    setEditingMode(false);
                    break;
            }
            return;
        }
        
        const start:number = textRef.current?.selectionStart ?? 0;
        const end:number = textRef.current?.selectionEnd ?? 0;
        const tbEvent: TextBlockEvent = {
            id: props.textBlockId,
            start: start,
            end: end,
            inserted: '',
        };
        
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
                setEditingMode(false);
                break;
            default:
                if (e.key.length === 1) {
                    e.preventDefault();
                    tbEvent.inserted = e.key;
                    handleTextEvent(tbEvent);
                    return;
                } else {
                    updateCaretPosition(textRef.current);
                }
        }
    }

    return (
        <Box>
        {
            editingMode &&
            <div style={{
                position: "relative",
                width: textAreaSize.x,
                height: textAreaSize.y,
            }}>
                <div style={{clear:"both"}}></div>
                <textarea 
                    ref={textRef as React.LegacyRef<HTMLTextAreaElement>}
                    autoFocus
                    value={collaborativeTextObject.text ?? ''}
                    dir="ltr" 
                    onKeyDown={(e) => onKeypress(e as any)}
                    onMouseDown={(e) => {
                        updateCaretPosition(textRef.current);
                    }}
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
                        collaborativeTextObject.relative && 
                        <UserCaret
                            x={collaborativeTextObject.relative.x*textAreaSize.x}
                            y={collaborativeTextObject.relative.y*textAreaSize.y}
                            idle={false}
                            color={"black"}
                        />
                    }
                    {
                        Array.from(roomUsers.entries()).map(([uid, user], i)=>{
                            if(!user?.textRoomData?.caret || user.sid === sockCtx.sid){ 
                                return null; 
                            }
                            return (
                                <UserCaret
                                    key={'usercaret'+uid}
                                    x={user.textRoomData.caret.x*textAreaSize.x}
                                    y={user.textRoomData.caret.y*textAreaSize.y}
                                    idle={user.idle}
                                    avatarUrl={user.user.profilePicture}
                                    name={fullName(user.user)}
                                />
                            );
                        })
                    }
    
                </div>
            </div>
        }
        {
            !editingMode && (collaborativeTextObject.text.length > 0) &&
            (
                props.markdown ? (
                    <MarkdownTextarea
                        style={{ cursor: 'text' }}
                        onDoubleClick={()=>{
                            setEditingMode(true);
                        }}
                    >
                        {collaborativeTextObject.text}
                    </MarkdownTextarea>
                ) : (
                    <Text
                        style={{ cursor: 'text' }}
                        onDoubleClick={()=>{
                            setEditingMode(true);
                        }}
                    >
                        {collaborativeTextObject.text}
                    </Text>
                )
            )
        }
        {
            !editingMode && (collaborativeTextObject.text.length === 0) &&
            <Text
                style={{ cursor: 'text' }}
                onDoubleClick={()=>{
                    setEditingMode(true);
                }}
            >
                {props.placeholder}
            </Text>
        }
        <Button
            key={editingMode ? "Done" : "Edit"}
            mt="1rem"
            onClick={()=>{
                setEditingMode(!editingMode);
            }}
        >
            {editingMode ? "Done" : "Edit"}
        </Button>
    </Box>
    )
}