import React, {useState} from "react";
import {useSocket} from "@trz/util/socket-context";
import { Box } from "@mantine/core";
import { useWindowEvent, useClickOutside } from '@mantine/hooks';

interface CollaborativeTextAreaProps {
}
const MAX_LINE_LENGTH = 5;
const ALLOWED_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()`~-_=+{}[];:'\",.<>/?\\| ";
type CursorPos = {pos:number, truePos:number};
export const CollaborativeTextArea = (props: CollaborativeTextAreaProps) => {
    const sockCtx = useSocket();
    const clickOutsideRef = useClickOutside(() => onBlur());
    const [demo_text, setText] = useState<string>("");
    const [cursor, setCursor] = useState<CursorPos|undefined>(undefined);
    const [highlight, setHighlight] = useState<CursorPos|undefined>(undefined);
    const [mouseDown, setMouseDown] = useState<boolean>(false);
    const [textLength, setTextLength] = useState<number>(0);
    let nextCharNum = 0;
    let nextTrueCharNum = 0;
    
    const onBlur = () => {
        setCursor(undefined);
        setHighlight(undefined);
    }
    const onMouseDown = (pos: CursorPos) => {
        setCursor(pos);
        setMouseDown(true);
        setHighlight(undefined);
    }
    const onMouseOver = (pos: CursorPos) => {
        if(mouseDown) {
            setHighlight(pos);
        }
    }
    const onMouseUp = () => {
        setMouseDown(false);
    }

    const insertText = (text:string, position:number) => {
        setText(demo_text.substring(0,position) + text + demo_text.substring(position));
    }
    const deleteText = (position:number, amount:number) => {
        if (position < 0 || position+amount > demo_text.length){
            // throw new Error("Invalid delete");
        }
        setText(demo_text.substring(0,position)+demo_text.substring(position+amount));
    }

    const moveCursor = (direction: "ArrowLeft"|"ArrowRight"|"ArrowDown"|"ArrowUp") => {
        if (cursor === undefined){
            return;
        }
        switch (direction) {
            case "ArrowRight":
                // setCursor({pos:Math.min(cursor.pos+1, nextCharNum-1), truePos:Math.min(cursor.truePos+1, nextTrueCharNum-1)});
                break;
            case "ArrowLeft":
                // setCursor(Math.max(0, cursor-1));
                break;
            case "ArrowDown":
                break;
            case "ArrowUp":
                break;
            default:
                throw new Error("Invalid direction "+direction);
        }
    }

    const handleKeypress = (e:KeyboardEvent) => {
        if(cursor === undefined){
            return;
        }
        if(e.ctrlKey || e.altKey){
            // TODO handle special keys
            return;
        }
        switch (e.key){
            case "Backspace":
                if(cursor.truePos > 0){
                    deleteText(cursor.truePos-1, 1);
                    setCursor({pos:cursor.pos-1,truePos:cursor.truePos-1});
                }
                break;
            case "Delete":
                if(cursor.truePos < nextCharNum-1){
                    deleteText(cursor.truePos, 1);
                }
                break;
            case "Enter":
            case "Return":
                insertText("\n",cursor.truePos);
                setCursor({pos:cursor.pos+1, truePos:cursor.truePos+1});
                    break;
            case "ArrowRight":
            case "ArrowLeft":
            case "ArrowUp":
            case "ArrowDown":
                moveCursor(e.key);
            default:
                if(e.key.length === 1 && ALLOWED_CHARS.indexOf(e.key) !== -1){
                    insertText(e.key, cursor.truePos);
                    const offset = (cursor.pos > 0 && cursor.pos % MAX_LINE_LENGTH === 0) ? 2 : 1;
                    setCursor({pos:cursor.pos+offset, truePos:cursor.truePos+1});
                }
        }
    }

    useWindowEvent("mouseup", onMouseUp)
    useWindowEvent("keydown",handleKeypress)

    const toRetAll = (
        <>
            <p>Cursor {cursor?.pos}, {cursor?.truePos}</p>
            <p>Highlight {highlight?.pos}, {highlight?.truePos}</p>
            <p>Text {demo_text.length}</p>
            <Box
                bd={"1px solid "+((cursor===undefined)?"black":"blue")} m={30} p={5} w="fit-content" miw="100px"
                ref={clickOutsideRef}
                onMouseDown={()=>{ if (demo_text.length === 0){ onMouseDown({pos:0, truePos:0}); } }}
            >
                {
                    demo_text.split("\n").map((pg, i) => {
                        // PARAGRAPHS
                        const lines = wrappedLines(pg, MAX_LINE_LENGTH);
                        const retPg = (
                            <Box key={"pg"+i} >
                                {
                                    // LINES
                                    lines.map((line, i)=>{
                                        const eol = nextCharNum + line.length;
                                        const trueEol = nextTrueCharNum + line.length;
                                        const retLine = (
                                            <Box  p={0} m={0} h="24px" key={"pg"+i} display={"flex"} >
                                                {
                                                    line.split('').map((c, i)=>{
                                                        // CHARACTERS
                                                        const toRetChar = (
                                                            <Character
                                                                onMouseDown={onMouseDown}
                                                                onMouseOver={onMouseOver}
                                                                pos={{pos:nextCharNum, truePos:nextTrueCharNum}}
                                                                char={c}
                                                                cursor={cursor}
                                                                highlight={highlight}
                                                                key={"c"+nextCharNum}
                                                            />
                                                        );
                                                        nextCharNum++;
                                                        nextTrueCharNum++;
                                                        return toRetChar;
                                                    })
                                                }
                                                <span
                                                    key={"ws"+i}
                                                    style={{ height: '1rem', lineHeight: "1", display: "inline-block", flex:"1" , backgroundColor: "green"}}
                                                    onMouseDownCapture={()=>{ onMouseDown({pos:eol, truePos:trueEol}); }}
                                                    onMouseOverCapture={()=>{ onMouseOver({pos:eol, truePos:trueEol}); }}
                                                >
                                                    { cursor?.pos === eol && <UserCursor color="red" /> }
                                                </span>
                                            </Box>
                                        )
                                        if(i < lines.length - 1){
                                            nextCharNum++;
                                        }
                                        return retLine;
                                    })
                                }
                            </Box>
                        );
                        nextCharNum++;
                        nextTrueCharNum++;
                        return retPg;
                    })
                }
            </Box>
            <p>Charnum {nextCharNum}</p>
            <p>TrueCharnum {nextTrueCharNum}</p>
        </>
    );
    return toRetAll;
}

interface UserCursorProps {
    color: string;
}
const UserCursor = (props: UserCursorProps) => {
    return (
        <Box
            w="1px"
            h="14px"
            mt="6px"
            ml="-0.5px"
            opacity=".7"
            bg={props.color}
            pos="absolute"
            display="inline-block"
        />
    )
}

interface CharacterProps {
    onMouseDown: (pos:CursorPos) => void;
    onMouseOver: (pos:CursorPos) => void;
    pos: CursorPos;
    char: string;
    cursor?: CursorPos;
    highlight?: CursorPos;
}
const Character = (props:CharacterProps) => {
    return(
        <React.Fragment> 
            <span
                style={{
                    height: '1rem',
                    lineHeight: "1",
                    fontFamily: 'monospace',
                    userSelect: "none",
                    display: "inline-block",
                    background: between(props.pos.pos, props.highlight?.pos, props.cursor?.pos) ? "#bad3fc": "transparent",
                    position: "relative"
                }}
                onMouseDownCapture={()=>{ props.onMouseDown(props.pos); }}
                onMouseOverCapture={()=>{ props.onMouseOver(props.pos); }}
            >
                {props.cursor?.pos === props.pos.pos && <UserCursor color="red" />}
                {props.char}
            </span>
        </React.Fragment>
    )
}

const splitWord = (word: string, chunkSizes:number) => {
    const chunks: string[] = [];
    while (word.length) {
        const chunk = word.slice(0, chunkSizes);
        word = word.substring(chunkSizes);
        chunks.push(chunk);
    }
    return chunks;
}

const between = (point:number, start?:number, end?:number, ) => {
    if (end === undefined || start === undefined){
        return false;
    }
    if (end > start) {
        return start <= point && point < end;
    }
    return end <= point && point < start;
}

const wrappedLines = (text:string, maxLineLength:number) => {
    const rawWords = text.split(" ");
    const words: string[] = [];
    for (let i = 0; i < rawWords.length; i++) {
        const word = rawWords[i];
        if (word.length > maxLineLength) {
            const splitWords = splitWord(word, maxLineLength);
            words.push(...splitWords);
        } else {
            words.push(word);
        }
    }

    if(words.length === 0){
        return [];
    }
    let lines = [words[0]]
    for (let i = 1; i < words.length; i++) {
        let line = lines[lines.length - 1];
        let word = words[i];
        if( line.length + word.length > maxLineLength ) {
            lines.push(word);
        } else {
            line += " " + word;
        }
    }
    return lines;
}