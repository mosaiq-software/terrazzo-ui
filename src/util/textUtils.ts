import { NoteType, notify } from "./notifications";

export interface Line {
    length:number;
    chars: {char:string, pos:number}[]
    hardWrap:boolean;
    eol: number;
}
export interface CursorPos {
    true: number;
    line:number;
    column:number;
}

export const ALLOWED_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()`~-_=+{}[];:'\",.<>/?\\| \n";
export const TAB_SPACES = "    ";
export const MULTI_CLICK_SPACING_THRESHOLD_MS = 500;

/*
    Break down a full raw text block into renderable lines
*/
export const getLines = (text:string, maxLineLength:number):Line[] => {    
    // break it apart by hard linebreaks
    const hardLines = text.split('\n');
    const lines:Line[] = [];
    let charNum = 0;

    for (let i = 0; i < hardLines.length; i++) {
        lines.push({
            length: 0,
            chars: [],
            hardWrap:false,
            eol: 1,
        });

        // split tokens by whitespace. Using regex not space char b/c we want to keep " " space strings as elements of the array
        const tokens = hardLines[i].split(/(\s)/);
        for (let i = 0; i < tokens.length; i++) {
            if(tokens[i].length === 0){
                continue;
            }
            let line = lines[lines.length-1];
            const words = splitLongWord(tokens[i], maxLineLength);
            
            // now, need to take each word and add it to the line. If the word can fit into the line, add it, else start a new line
            for (let w = 0; w < words.length; w++) {
                line = lines[lines.length-1];
                const word = words[w];
                const chars = [...word].map((c)=>{
                    charNum++;
                    return { char: c, pos: charNum-1 };
                });

                if (line.length + word.length <= maxLineLength) {
                    line.length += word.length;
                    line.chars.push(...chars);
                    line.eol = line.chars[line.chars.length-1].pos+1;
                } else {
                    // if its a space at the start of a new line, ignore it. We dont want spaces starting lines
                    if( word === " "){
                        continue;
                    }
                    lines.push({
                        length: word.length,
                        chars: chars,
                        hardWrap: false,
                        eol: chars[chars.length-1].pos+1
                    });
                }
            }
        }

        // set the last line to be hard wrapped since it was originally broken by a \n
        lines[lines.length-1].hardWrap = true;
        lines[lines.length-1].eol = charNum;
        charNum++; // account for \n
    }
    return lines;
}

/*
    Split a long word into chunks
    This is for wrapping words longer than the line max length
*/
export const splitLongWord = (word: string, chunkSizes:number) => {
    const chunks: string[] = [];
    while (word.length) {
        const chunk = word.slice(0, chunkSizes);
        word = word.substring(chunkSizes);
        chunks.push(chunk);
    }
    return chunks;
}

/*
    Check if a point lies between 2 numbers
*/
export const pointIsBetween = (point:number, start?:number, end?:number, ) => {
    if (end === undefined || start === undefined){
        return false;
    }
    if (end > start) {
        return start <= point && point < end;
    }
    return end <= point && point < start;
}

/*
    ensure that every character in the string is a valid input character
*/
export const isValidInputString = (input: string) => {
    return true; // need better way to validate. Should clean the string too. Like making emojis into their :+1: form and curly quotes to straight quotes
    for (let i = 0; i < input.length; i++) {
        if (ALLOWED_CHARS.indexOf(input[i]) === -1) {
            return false;
        }
    }
    return true;
}


export const printLines = (lines:Line[],text:string) => {
    let a = "";
    for (let line of lines) {
        for (let c of line.chars) {
            a += ` ${c.char.replace("\n","/n").replace(" ","_")}${c.pos} `;
        }
        a += ` =${line.eol}\n`
    }
    console.log(text.replace("\n","/n").replace(" ","_"))
    console.log(a);
}

/*
    Get the true position of the cursor in the text based on line/col
*/
export const getCursorTruePosition = (L:Line[], cursor?: CursorPos):CursorPos|undefined => {
    if (!cursor || cursor.line < 0 || cursor.line >= L.length || cursor.column < 0) {
        return undefined;
    }
    if(cursor.column >= L[cursor.line].chars.length){
        return {
            true: L[cursor.line].eol,
            line: cursor.line,
            column: cursor.column,
        };
    }
    return {
        true: L[cursor.line].chars[cursor.column].pos,
        line: cursor.line,
        column: cursor.column,
    };
}

/*
    Get the line/col of the cursor based on the true position of it in the text
*/
export const getCursorPseudoPosition = (L:Line[], truePos:number): CursorPos | undefined => {
    for (let l = 0; l < L.length; l++) {
        for (let c = 0; c < L[l].chars.length; c++) {
            if (L[l].chars[c].pos === truePos) {
                return {
                    true: truePos,
                    line: l,
                    column: c
                }
            }
        }
        if (L[l].eol === truePos) {
            return {
                true: truePos,
                line: l,
                column: L[l].length
            }
        }
    }
    return undefined;
}

/*
    Get the position of the cursor shifted up/down a line
*/
export const getVerticalLineShift = (L:Line[], direction:1|-1, cursor:CursorPos, targetCol?:number):CursorPos => {
    const targetLine = cursor.line + direction;
    if (targetLine < 0) {
        return {true:0, line:0, column:0};
    }
    if (targetLine >= L.length) {
        return {true: L[L.length-1].eol , line: L.length-1, column: L[L.length-1].length};
    }
    const line = L[targetLine];
    const c = {
        true: 0,
        line: targetLine,
        column: clamp((targetCol ?? cursor.column), 0, line.length)
    };
    return getCursorTruePosition(L, c) ?? c;
}

/*
    Given the index of a character, find the word (space delimited) its in
*/
export const getWordBounds = (truePos:number, text:string): {start:number, end:number} => {
    const endString = text.substring(truePos);
    let end = Math.min(negOneTo(endString.indexOf(" ")), negOneTo(endString.indexOf("\n")));
    end = end >= 10E10 ? text.length : end + truePos;
    const startString = text.substring(0,end);
    let start = Math.max((startString.lastIndexOf(" ")), startString.lastIndexOf("\n"));
    start = start === -1 ? 0 : start+1;
    return {start, end};
}

export const diff = (a:number, b:number) => {
    return Math.max(a,b) - Math.min(a,b);
}

export const clamp = (x:number, min:number, max:number) => {
    return Math.max(min, Math.min(x, max));
}

export const negOneTo = (value:number, to?:number) => {
    if(value === -1)
        return to ?? 10E10;
    return value;
}

export const minCursor = (ca:CursorPos, cb:CursorPos):CursorPos => {
    if (ca.true <= cb.true){
        return ca;
    }
    return cb;
}

export const maxCursor = (ca:CursorPos, cb:CursorPos):CursorPos => {
    if (ca.true >= cb.true){
        return ca;
    }
    return cb;
}

export const copyTextToClipboard = async (text:string) => {
    try {
        await navigator.clipboard.writeText(text);
    } catch (error:any) {
        console.error(error);
        notify(NoteType.CLIPBOARD_COPY_ERROR);
    }
}

export const pasteTextFromClipboard = async ():Promise<string|undefined> => {
    try {
        const text = await navigator.clipboard.readText();
        return text;
    } catch (error:any) {
        console.error(error);
        notify(NoteType.CLIPBOARD_COPY_ERROR);
        return undefined;
    }
}

export const getTextSelection = (text:string, from:CursorPos, to:CursorPos):string => {
    return text.substring(minCursor(from,to).true, maxCursor(from,to).true);
}