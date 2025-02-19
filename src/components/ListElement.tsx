import React, {useEffect, useState} from "react";
import EditableTextbox from "@trz/components/EditableTextbox";
import {Button, Group, Paper, Stack, Title, CloseButton, TextInput, Flex, FocusTrap} from "@mantine/core";
import {useClickOutside, getHotkeyHandler, useInViewport} from "@mantine/hooks";
import {List} from "@mosaiq/terrazzo-common/types";
import {useSocket} from "@trz/util/socket-context";
import {NoteType, notify} from "@trz/util/notifications";
import { captureDraggableEvents, captureEvent, forAllClickEvents } from "@trz/util/eventUtils";


interface ListElementProps {
    listType: List;
    children?: React.ReactNode;
    dragging: boolean;
    droppableSetNodeRef?: (element: HTMLElement | null) => void;
    handleProps?: any;
    index: number;
}
function ListElement(props: ListElementProps): React.JSX.Element {
    const [listTitle, setListTitle] = React.useState(props.listType.name || "List Title");
    const [visible, setVisible] = useState(false);
    const [error, setError] = useState("");
    const [cardTitle, setCardTitle] = useState("");
    const clickOutsideRef = useClickOutside(() => onBlur());
    const sockCtx = useSocket();
    
    function onSubmit() {
        setError("")
        setCardTitle("");

        if (cardTitle.length < 1) {
            setError("Enter a Title")
            return;
        }

        if (cardTitle.length > 50) {
            setError("Max 50 characters")
            return;
        }

        sockCtx.addCard(props.listType.id, cardTitle).then((success) => {
            if (!success) {
                notify(NoteType.CARD_CREATION_ERROR);
                return;
            }
        }).catch((err) => {
            console.error(err);
        });
        setVisible(false);
    }

    function onTitleChange(value: string) {
        setListTitle(value);
        sockCtx.updateListTitle(props.listType.id, value).then((success) => {
            if (!success) {
                notify(NoteType.LIST_UPDATE_ERROR);
                return;
            }
        });
    }

    useEffect(() => {
        setListTitle(props.listType.name || "List Title");
    })

    function onBlur(){
        setCardTitle("");
        setError("");
        setVisible((v) => !v)
    }

    return (
        <Paper
            bg="#121314"
            radius="md"
            shadow="lg"
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "stretch",
                minWidth: "250px",
                maxWidth: "250px",
                zIndex: 10,
                transition: "transform .1s, box-shadow .1s",
                ...(props.dragging ? {
                    transform: "rotateZ(3deg) scale(1.02)",
                    boxShadow: "10px 8px 25px black",
                    border: "1px solid #14222e",
                } : undefined)
            }}
        >
            <Group
                {...props.handleProps}
                justify="space-between"
                align="center"
                wrap="nowrap"
                p="xs"
                style={{
                    cursor:"pointer",
                }}
            >
                <p style={{color:"#fff"}}>{props.index} {props.listType.id.substring(0,2)}</p>
                <EditableTextbox 
                    value={listTitle}
                    onChange={onTitleChange}
                    placeholder="Click to edit!"
                    type="title"
                    titleProps={{order: 6, c: "#ffffff"}}
                    style={{
                        cursor: "text"
                    }}
                />
                <Button 
                    {...captureDraggableEvents(captureEvent, forAllClickEvents((e)=>{captureEvent(e)}))}
                    variant="subtle" 
                    c="#ffffff"
                    h="xs"><Title order={6} c="#ffffff">•••</Title></Button>
            </Group>
            <Stack
                ref={props.droppableSetNodeRef}
                mt="md"
                mb="md"
                gap={10}
                mah="75vh"
                flex={1}
                style={{
                    overflowY: "auto",
                    overflowX: "hidden"
                }}
            >
                { props.children }
                <Group>
                    {visible &&
                        <Paper 
                            bg={"#121314"}
                            w="250"
                            radius="md"
                            shadow="lg"
                            ref={clickOutsideRef}
                            onKeyDown={getHotkeyHandler([['Enter', onSubmit]])}
                        >
                            <FocusTrap>
                                <TextInput
                                    placeholder="Enter card title..."
                                    value={cardTitle}
                                    onChange={(event) => setCardTitle(event.currentTarget.value)}
                                    error={error}
                                    p="5"
                                />
                            </FocusTrap>
                            <Flex p='5'>
                                <Button 
                                    w="150"
                                    variant="light"
                                    onClick={onSubmit}
                                >
                                    Create Card
                                </Button>
                                <CloseButton 
                                    onClick={onBlur}
                                    size='lg'
                                />
                            </Flex>
                        </Paper>
                    }
                </Group>
            </Stack>

            {!visible &&
                <Button 
                    w="100%"
                    variant="light"
                    onClickCapture={(e) => {
                        setVisible((v) => !v)
                    }}
                >
                    Add Card +
                </Button>
            }
        </Paper>
    );
};

export default ListElement;
