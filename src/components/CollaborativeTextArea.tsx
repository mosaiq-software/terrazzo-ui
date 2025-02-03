import React, {useState} from "react";
import {useSocket} from "@trz/util/socket-context";
import { Box } from "@mantine/core";

interface CollaborativeTextAreaProps {
}
const MAX_LINE_LENGTH = 10;
export const CollaborativeTextArea = (props: CollaborativeTextAreaProps) => {
    const sockCtx = useSocket();
    const [text, setText] = useState<string>("aaaab\n\naabcdef aaabb aa");
    const [cursor, setCursor] = useState<number>(0);
    const [highlight, setHighlight] = useState<number>(0);

    let charNum = 0;
    return (
        <>
            <p>{cursor}</p>
            <Box
                bd="1px solid red"
                w="fit-content"
                m={50}
                p={0}
            >
                {
                    text.split("\n").map((pg, i) => {
                        const rawWords = pg.split(" ");
                        const words: string[] = [];
                        for (let i = 0; i < rawWords.length; i++) {
                            const word = rawWords[i];
                            if (word.length > MAX_LINE_LENGTH) {
                                const splitWords = splitWord(word, MAX_LINE_LENGTH);
                                words.push(...splitWords);
                            } else {
                                words.push(word);
                            }
                        }
                        let lines = [''];
                        for (let i = 0; i < words.length; i++) {
                            let line = lines[lines.length - 1];
                            const space = i < words.length-1 ? " " : "";
                            if (line.length + words[i].length > MAX_LINE_LENGTH) {
                                lines.push(words[i] + space);
                            } else {
                                lines[lines.length - 1] += words[i] + space;
                            }
                        }

                        return (
                            <Box>
                                {
                                    lines.map((line, i)=>{
                                        return (
                                            <Box 
                                                p={0}
                                                m={0}
                                            >
                                                {
                                                    line.split('').map((c, i)=>{
                                                        const myCharNum = charNum;
                                                        charNum++;
                                                        return(
                                                            <>
                                                                {
                                                                    cursor === myCharNum &&
                                                                    <UserCursor color="red" />
                                                                }
                                                                <span
                                                                    style={{
                                                                        height: '16px',
                                                                        fontFamily: 'monospace',
                                                                        userSelect: "none"
                                                                    }}
                                                                    onClick={()=>{
                                                                        setCursor(myCharNum);
                                                                    }}
                                                                    >
                                                                    {c}
                                                                </span>
                                                            </>
                                                        )
                                                    })
                                                }
                                            </Box>
                                        )
                                    })
                                }
                            </Box>
                        );
                    })
                }
            </Box>
        </>
    );
}

interface UserCursorProps {
    color: string;
}
const UserCursor = (props: UserCursorProps) => {
    return (
        <Box
            w="2px"
            h="16px"
            bg={props.color}
            pos="inherit"
        />
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