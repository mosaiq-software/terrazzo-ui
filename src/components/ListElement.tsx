import React, {useEffect, useState} from "react";
import EditableTextbox from "@trz/components/EditableTextbox";
import {Button, Group, Paper, Stack, CloseButton, TextInput, Flex, FocusTrap, Menu, Tooltip} from "@mantine/core";
import {useClickOutside, getHotkeyHandler, useInViewport} from "@mantine/hooks";
import {List} from "@mosaiq/terrazzo-common/types";
import {useSocket} from "@trz/util/socket-context";
import {NoteType, notify} from "@trz/util/notifications";
import { captureDraggableEvents, captureEvent, forAllClickEvents } from "@trz/util/eventUtils";
import {FaArchive, FaCalendarCheck} from "react-icons/fa";
import {HiDotsVertical} from "react-icons/hi";
import {ListType} from "../../../terrazzo-common/dist/constants";
import {getMonthName} from "@trz/util/dateUtils";


interface ListElementProps {
    listType: List;
    children?: React.ReactNode;
    dragging: boolean;
    droppableSetNodeRef?: (element: HTMLElement | null) => void;
    handleProps?: any;
    isOverlay: boolean;
}
function ListElement(props: ListElementProps): React.JSX.Element {
    const [listTitle, setListTitle] = React.useState(props.listType.name || "List Title");
    const [dateTitle, setDateTitle] = React.useState("");
    const [visible, setVisible] = useState(false);
    const [error, setError] = useState("");
    const [cardTitle, setCardTitle] = useState("");
    const clickOutsideRef = useClickOutside(() => onBlur());
    const sockCtx = useSocket();
    
    async function onSubmit() {
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

        try{
            console.log(props.listType.type)
            if(props.listType.type === ListType.NORMAL){
                await sockCtx.createCard(props.listType.id, cardTitle, props.listType.id)
            }else{
                await sockCtx.createCard(props.listType.id, cardTitle)
            }
        } catch (e) {
            notify(NoteType.CARD_CREATION_ERROR, e);
            return;
        }
        setVisible(false);
    }

    function onTitleChange(value: string) {
        setListTitle(value);
        try {
            sockCtx.updateListField(props.listType.id, {name: value})
        } catch (e: any){
            notify(NoteType.LIST_UPDATE_ERROR, e);
            return;
        }
    }

    async function onArchive() {
        await sockCtx.updateListField(props.listType.id, {archived: true, order: -1});
    }

    useEffect(() => {
        if(props.listType.startDate != null && props.listType.endDate != null){
            const start = new Date(props.listType.startDate);
            const end = new Date(props.listType.endDate);
            setDateTitle(` (${getMonthName(start.getMonth())}/${start.getDate()} - ${getMonthName(end.getMonth())}/${end.getDate()})`);
        }else{
            setListTitle(props.listType.name || "List Title");
        }
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
                alignItems: "center",
                minWidth: "275px",
                maxWidth: "275px",
                minHeight: "5rem",
                maxHeight: "88vh",
                transition: `transform .1s, box-shadow .1s, filter 0ms linear ${props.dragging ? '0ms' : '225ms'}`,
                ...(props.dragging ? props.isOverlay ? {
                    transform: "rotateZ(3deg) scale(1.02)",
                    boxShadow: "10px 8px 25px black",
                    border: "1px solid #14222e",
                    zIndex: 11,
            } : {
                    filter: "grayscale(1) contrast(0) brightness(0) blur(6px)",
                    opacity: .4,
                    zIndex: 10,
            } : undefined)
            }}
        >
            <Group
                {...props.handleProps}
                justify="space-between"
                align="center"
                wrap="nowrap"
                py="xs"
                px="sm"
                w="100%"
                style={{
                    cursor:"pointer",
                    height: "3rem",
                }}
            >
                <EditableTextbox
                    value={listTitle}
                    onChange={onTitleChange}
                    subText={dateTitle}
                    placeholder="Click to edit!"
                    type="title"
                    titleProps={{order: 6, c: "#ffffff"}}
                    style={{
                        width: "100%",
                    }}
                />

                <Menu
                    shadow="md"
                    width={200}
                    position="right-start"
                    withArrow
                    arrowPosition="center"
                    withOverlay={true}
                    closeOnClickOutside={true}
                >
                    <Menu.Target>
                        <Button
                            {...captureDraggableEvents(captureEvent, forAllClickEvents((e)=>{captureEvent(e)}))}
                            variant="subtle"
                            c="#ffffff"
                            h="100%"
                            px={5}
                        >
                            <HiDotsVertical />
                        </Button>
                    </Menu.Target>
                    <Menu.Dropdown
                        {...captureDraggableEvents(captureEvent, forAllClickEvents((e)=>{captureEvent(e)}))}
                    >
                        {props.listType.type !== ListType.NORMAL &&
                            <Menu.Label>Special list of {props.listType.type}</Menu.Label>
                        }
                        <Menu.Label>Settings</Menu.Label>
                        <Tooltip
                            label="Can't End Sprint on special lists"
                            position="right-start"
                            offset={12}
                            withArrow
                            arrowPosition="center"
                            arrowOffset={24}
                            arrowSize={5}
                            events={{
                                hover:props.listType.type !== ListType.NORMAL,
                                focus:props.listType.type !== ListType.NORMAL,
                                touch:props.listType.type !== ListType.NORMAL
                            }}
                        >
                            <Menu.Item
                                onClick={onArchive}
                                disabled={props.listType.type !== ListType.NORMAL}
                                leftSection={<FaCalendarCheck />}
                            >
                                End Sprint
                            </Menu.Item>
                        </Tooltip>
                    </Menu.Dropdown>
                </Menu>
            </Group>
            <Stack
                ref={props.droppableSetNodeRef}
                mb="md"
                gap={5}
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
                    color="gray"
                    onClickCapture={(e) => {
                        setVisible((v) => !v)
                    }}
                    style={{
                        maxHeight: '2.5rem',
                        minHeight: '2.25rem',
                        borderTopLeftRadius: 0,
                        borderTopRightRadius: 0
                    }}
                    radius="md"
                >
                    Add Card +
                </Button>
            }
        </Paper>
    );
}

export default ListElement;
