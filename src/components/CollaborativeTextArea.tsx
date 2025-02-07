import React, {useEffect, useRef, useState} from "react";
import {useSocket} from "@trz/util/socket-context";
import { Box, Textarea } from "@mantine/core";
import { useWindowEvent, useClickOutside } from '@mantine/hooks';
import { printLines, CursorPos, getLines, Line, pointIsBetween, isValidInputString, getCursorPseudoPosition, getCursorTruePosition, TAB_SPACES, diff, clamp, maxCursor, minCursor, getVerticalLineShift, MULTI_CLICK_SPACING_THRESHOLD_MS, getWordBounds, copyTextToClipboard, getTextSelection, pasteTextFromClipboard } from "@trz/util/textUtils";

interface CollaborativeTextAreaProps {
    maxLineLength: number;
    fontSize?: number;
}

export const CollaborativeTextArea = (props: CollaborativeTextAreaProps) => {
    const startTime = performance.now()

    const sockCtx = useSocket();
    const clickOutsideRef = useClickOutside(() => onBlur());
    const [demo_text, setText] = useState<string>("Terrazzo Purpose Now that Mosaiq has expanded to more than 10 members, we need to find an alternative to Trello (as the premium edition is very expensive). Instead of finding a random alternative online, we can use this as an opportunity to build our own project management system that fits our own needs exactly. With 14 members on the team, this new product will save Mosaiq over $2,600 a year in Trello and plugin fees. Overview Terrazzo is a product similar to Trello, in that it will allow us to manage work items needed for project and sort them into sprints. Product requirements L0 Features Ability to sign in as through GitHub authentication (only members of the mosaiq-software org should be allowed in) Ability to create and see a project board (visible to all members) Ability to create and see lists in the project board Ability to create and see cards in a list Ability to click on a card and have its fields displayed (just name and code for now) Ability to drag a card from one list to another L1 Features A set of cards can be grouped into a sprint A sprint can have a set start and end date Ability to see sprints for a board Ability to add/edit a description card Ability to add/edit assignees to a card Ability to add comments on a card Ability to edit the name on a card Ability to edit the sprint the card is for Ability to edit the story points the card has Ability to edit the priority level for a card Ability to edit the name and code for a board Board settings page Add/edit labels for a board Add/remove labels from a card L2 Features Ability to attach media to a card Upload with a link and embed in md Direct uploaded files get stored on CDN and link set to use in md Ability to track time-on-task through a card (manual input to logs) Ability to automatically track ToT through a timer for each user Ability to see a users profile Github profile pictures get used as user icons Implement workspace handling The owner of a GH org can make a workspace for that org Every member of the org can automatically see all workspaces for any org they are a member of. L3 Features Admin dashboard with overviews for data and user management Ability to start and end sprints Ability to start a live planning poker session for a sprint Ability to see a burndown chart for the end of a sprint with calculated avg sprint velocity Ability to make a private board that only added members can see Dashboard where any member can see their assigned cards Ability to automatically correlate a GitHub PR with a card L4 Features Ability to quickly import over a trello board (from json or csv) or a github projects board Logging based backup system that can track every action performed and undo it if needed (timeline of events sorta thing) Ability to view the event logs and rollback if needed API endpoint to fetch a view-only simplified version of a board L+ Features Custom wiki system (like confluence or this wiki) integrated into the platform Implement this in Electron to have it run as a standalone app Look into a more public facing landing page for users to sign up for this app Custom discord bot (very similar to tilebot) that can handle being in multiple servers and give users info about their workspace (linking discord, github, and trz) TRZ classroom? Old PRD This needs to be a simple Trello alternative for the Mosaiq team to use for internal project tracking. Single workspace with the ability to add and remove members (but with the ability to add this functionality in the future!) Sign on with Github Auth Can create / view boards Boards will have a set of lists in them Board will have a title, and a code to them Main lists are Done, In PR, Doing, Backlog. These lists will appear on every board by detault. These names are reserved to later be processed for overviews on a dashboard Lists for each sprint can be created through the ui Lists can have cards Cards can have Title Description Priority Story points Comments Attatched sprint Card code (XXX-123) Assignees Cards can be moved between lists using drag and drop Ability to start a planning poker session with the cards in a sprint Ability to track Time on Task for each card with either text input or an integrated timer All changes to anything should be tracked using a git like system, and backed up regularly to github (like wiki does)");
    const [cursor, setCursor] = useState<CursorPos|undefined>(undefined);
    const [highlight, setHighlight] = useState<CursorPos|undefined>(undefined);
    const [cursorTargetColumn, setCursorTargetColumn] = useState<number|undefined>(undefined);
    const [mouseDown, setMouseDown] = useState<boolean>(false);
    const [lines, setLines] = useState<Line[]>([]);


    useEffect(()=>{
        const L = getLines(demo_text, props.maxLineLength);
        setLines(L);
    },[])

    const onBlur = () => {
        setCursor(undefined);
        setCursorTargetColumn(undefined);
        setHighlight(undefined);
    }
    const onMouseDown = (pos: CursorPos) => {
        setCursor(pos);
        setCursorTargetColumn(pos.column);
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
    const onNClicks = (n:number, pos:CursorPos) => {
        if (n === 2) {
            const {start, end} = getWordBounds(pos.true, demo_text);
            setCursor(getCursorPseudoPosition(lines, start))
            setHighlight(getCursorPseudoPosition(lines, end))
            return;
        }
        if (n === 3) {
            setCursor(getCursorTruePosition(lines, {...pos, column:0}));
            setHighlight(getCursorTruePosition(lines, {...pos, column:10E10}));
            return;
        }
        if (n === 4) {
            setCursor({true:0, column:0, line:0});
            setHighlight(getCursorTruePosition(lines, {...pos, line:lines.length-1, column:10E10}));
            return;
        }
    }

    // insert text, where new text will start at the position
    const insertText = (oldText, insertedText:string, position:number) => {
        if(!isValidInputString(insertedText)) {
            return;
        }
        const newText = oldText.substring(0,position) + insertedText + oldText.substring(position)
        const L = getLines(newText, props.maxLineLength);
        const pseudopos = getCursorPseudoPosition(L, position + insertedText.length )
        setText(newText);
        setLines(L);
        setCursor(pseudopos);
        setCursorTargetColumn(pseudopos?.column);
        setHighlight(undefined);

    }

    // delete text from position to (position + amount - 1)
    const deleteText = (oldText:string, position:number, amount:number, shift:boolean) => {
        if (position < 0 || position+amount > oldText.length){
            return;
        }
        const newText = oldText.substring(0,position)+oldText.substring(position+amount);
        const L = getLines(newText, props.maxLineLength);
        setText(newText);
        setLines(L);
        setHighlight(undefined);
        if(shift){
            const pseudopos = getCursorPseudoPosition(L, position - amount + 1)
            setCursor(pseudopos);
            setCursorTargetColumn(pseudopos?.column);
        }
    }

    const replaceText = (oldText:string, insertedText:string, position:number, amountToDelete:number)=> {
        console.log (position < 0 , position+amountToDelete > oldText.length , !isValidInputString(insertedText) )
        if (position < 0 || position+amountToDelete > oldText.length || !isValidInputString(insertedText)) {
            return;
        }
        const newText = oldText.substring(0,position) + insertedText + oldText.substring(position+amountToDelete);
        const L = getLines(newText, props.maxLineLength);
        const pseudopos = getCursorPseudoPosition(L, position + insertedText.length )
        setText(newText);
        setLines(L);
        setCursor(pseudopos);
        setCursorTargetColumn(pseudopos?.column);
        setHighlight(undefined);
    }

    const replaceTextCursors = (oldText:string, insertedText:string, pos1:CursorPos, pos2?:CursorPos) => {
        replaceText(oldText, insertedText, Math.min(pos1.true, (pos2??pos1).true), diff(pos1.true, (pos2??pos1).true));
    }

    // Move the cursor using the arrow keys
    const moveCursor = (direction: "ArrowLeft"|"ArrowRight"|"ArrowDown"|"ArrowUp", shift:boolean) => {
        if (cursor === undefined){
            return;
        }
        if (direction === "ArrowRight" || direction === "ArrowLeft") {
            if (shift) {
                const p = getCursorPseudoPosition(lines, clamp((highlight ?? cursor).true + (direction === "ArrowRight" ? 1 : -1), 0, demo_text.length));
                setHighlight(p)
                return;
            }
            let p = getCursorPseudoPosition(lines, clamp(cursor.true + (direction === "ArrowRight" ? 1 : -1), 0, demo_text.length));
            if(highlight && highlight.true !== cursor.true) {
                p = direction === "ArrowRight" ? maxCursor(cursor, highlight) : minCursor(cursor, highlight);
            }
            setCursor(p);
            setCursorTargetColumn(p?.column);
            setHighlight(undefined);
            return;
        }

        if (direction === "ArrowDown" || direction === "ArrowUp") {
            if (shift) {
                const p = getVerticalLineShift(lines, (direction === "ArrowDown" ? 1 : -1), (highlight ?? cursor));
                setHighlight(p);
                return;
            }
            let p = getVerticalLineShift(lines, (direction === "ArrowDown" ? 1 : -1), cursor, cursorTargetColumn);
            if(highlight && highlight.true !== cursor.true) {
                p = direction === "ArrowDown" ? maxCursor(cursor, highlight) : minCursor(cursor, highlight);
            }
            setCursor(p);
            setHighlight(undefined);
            return;
        }
        

        throw new Error("Invalid direction "+direction);
    }


    const handleKeypress = (e:KeyboardEvent) => {
        if (cursor === undefined) {
            return;
        }
        e.preventDefault();

        if (e.ctrlKey) {
            switch (e.key) {
                case "a":
                    setCursor({true:0, column:0, line:0});
                    setHighlight(getCursorTruePosition(lines, {true:0, line:lines.length-1, column:10E10}));
                    break;
                case "c":
                    if(highlight){
                        copyTextToClipboard(getTextSelection(demo_text, cursor, highlight))
                    }
                    break;
                case "v":
                    pasteTextFromClipboard().then((text)=>{
                        if(text){
                            replaceTextCursors(demo_text, text, cursor, highlight);
                        }
                    })
                    break
                case "x":
                        break;
                case "z":
                    if (!e.shiftKey){
                        //undo
                        break;
                    }
                    // fallthrough
                case "y":
                    break;
            }
            return;
        }
        switch (e.key){
            case "Backspace":
                if(highlight){
                    replaceTextCursors(demo_text,"",cursor,highlight)
                    break;
                }
                // delete 1 char to the left of the cursor
                if(cursor.true > 0){
                    deleteText(demo_text, cursor.true-1, 1, true);
                }
                setHighlight(undefined);
                break;
            case "Delete":
                if(highlight){
                    replaceTextCursors(demo_text,"",cursor,highlight)
                    break;
                }
                // delete 1 char to the right of the cursor
                if(cursor.true < demo_text.length){
                    deleteText(demo_text, cursor.true, 1, false);
                }
                setHighlight(undefined);
                break;
            case "Enter":
            case "Return":
                insertText(demo_text, "\n",cursor.true);
                setHighlight(undefined);
                break;
            case "Tab":
                insertText(demo_text, TAB_SPACES, cursor.true);
                setHighlight(undefined);
                break;
            case "ArrowRight":
            case "ArrowLeft":
            case "ArrowUp":
            case "ArrowDown":
                moveCursor(e.key, e.shiftKey);
                break;
            default:
                if (e.key.length === 1) {
                    if (highlight) {
                        replaceTextCursors(demo_text, e.key, cursor, highlight)
                    } else {
                        insertText(demo_text, e.key, cursor.true);
                    }
                    setHighlight(undefined);
                }
            break;

        }
    }

    useWindowEvent("mouseup", onMouseUp)
    useWindowEvent("keydown",handleKeypress)


    const render = (
        <Box
            w={"fit-content"}
            p={"1ch"}
            bd={"1px solid "+((cursor===undefined)?"black":"blue")}
            ref={clickOutsideRef}
            onMouseDown={()=>{ if (demo_text.length === 0){ onMouseDown({true: 0, line: 0, column: 0}); } }}
        >
            <Box
                w={props.maxLineLength+"ch"}
                mih={"1lh"}
                style={{
                    lineHeight: "1",
                    fontFamily: 'monospace',
                    fontSize:props.fontSize??16
                }}
            >
                {
                    lines.map((line, i) => {
                        return (
                            <Box
                                p={0}
                                m={0}
                                key={"line"+i}
                                display={"flex"}
                                style={{fontSize:props.fontSize??16}}
                            >
                                {
                                    line.chars.map((c, j)=>{
                                        return (
                                            <Character
                                                onMouseDown={onMouseDown}
                                                onMouseOver={onMouseOver}
                                                onNClicks={onNClicks}
                                                char={c}
                                                pos={{true: c.pos, line: i, column: j}}
                                                cursor={cursor}
                                                highlight={highlight}
                                                key={i+"c"+j}
                                            />
                                        );
                                    })
                                }
                                <span
                                    key={"eol"+i}
                                    style={{
                                        lineHeight: "1",
                                        display: "inline-block",
                                        flex: "1",
                                        minWidth: "1ch",
                                        height: "1lh"
                                    }}
                                    onMouseDownCapture={()=>{ onMouseDown({true: line.eol, line: i, column: line.length}) }}
                                    onMouseOverCapture={()=>{ onMouseOver({true: line.eol, line: i, column: line.length}) }}
                                >
                                    { cursor?.column === line.length && cursor?.line === i && <UserCursor color="red" /> }
                                </span>
                            </Box>
                        );
                    })
                }
            </Box>
        </Box>
    );

    const endTime = performance.now()
    console.log(`Call to render took ${endTime - startTime} milliseconds`)
    return render;
}

interface UserCursorProps {
    color: string;
}
const UserCursor = (props: UserCursorProps) => {
    return (
        <Box
            w="2px"
            h="1lh"
            ml="-0.5px"
            opacity=".7"
            bg={props.color}
            pos="absolute"
            display="inline-block"
            style={{
                height: '100%',
                lineHeight: "1",
                fontFamily: 'monospace',
            }}
        />
    )
}

interface CharacterProps {
    onMouseDown: (pos:CursorPos) => void;
    onMouseOver: (pos:CursorPos) => void;
    onNClicks: (n:number, pos:CursorPos) => void;
    char: {char:string, pos:number};
    pos: CursorPos;
    cursor?: CursorPos;
    highlight?: CursorPos;
}
const Character = (props:CharacterProps) => {
    const [lastClicks, setLastClicks] = useState<number[]>([]);

    const onClick = () => {
        const ms = Date.now();
        // each click, add it to array. If last click was less than 500 ms ago, fire n clicks event
        if (lastClicks.length > 0 && ms - lastClicks[lastClicks.length-1] <= MULTI_CLICK_SPACING_THRESHOLD_MS) {
            props.onNClicks(lastClicks.length + 1, props.pos);
            setLastClicks([...lastClicks, ms]);
        } else {
            setLastClicks([ms]);
        }
    }

    return(
        <span
            style={{
                height: '1lh',
                width: "1ch",
                position: "relative",
                lineHeight: "1",
                fontFamily: 'monospace',
                fontSize: "inherit",
                userSelect: "none",
                display: "inline-block",
                background: pointIsBetween(props.pos.true, props.highlight?.true, props.cursor?.true) ? "#bad3fc": "transparent",
            }}
            onDragStart={()=>{return false;}}
            onMouseDownCapture={()=>{ props.onMouseDown(props.pos); }}
            onMouseOverCapture={()=>{ props.onMouseOver(props.pos); }}
            onClick={onClick}
        >
            {props.cursor?.column === props.pos.column && props.cursor?.line === props.pos.line && <UserCursor color="red" />}
            {props.char.char}
        </span>
    )
}