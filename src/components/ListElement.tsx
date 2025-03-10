import React, {useEffect, useState} from "react";
import EditableTextbox from "@trz/components/EditableTextbox";
import {Button, Group, Paper, Stack, CloseButton, TextInput, Flex, FocusTrap, Menu, Text} from "@mantine/core";
import {useClickOutside, getHotkeyHandler} from "@mantine/hooks";
import {CardId, ListHeader, ListId} from "@mosaiq/terrazzo-common/types";
import {useSocket} from "@trz/contexts/socket-context";
import {NoteType, notify} from "@trz/util/notifications";
import { captureDraggableEvents, captureEvent, forAllClickEvents } from "@trz/util/eventUtils";
import {FaArchive} from "react-icons/fa";
import {HiDotsVertical} from "react-icons/hi";
import { createCard, getListData, updateListField } from "@trz/emitters/all";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableCard from "./DragAndDrop/SortableCard";
import { useSocketListener } from "@trz/hooks/useSocketListener";
import { ServerSE } from "@mosaiq/terrazzo-common/socketTypes";
import { updateBaseFromPartial } from "@mosaiq/terrazzo-common/utils/arrayUtils";


interface ListElementProps {
    listId: ListId;
    dragging: boolean;
    droppableSetNodeRef?: (element: HTMLElement | null) => void;
    handleProps?: any;
    isOverlay: boolean;
    boardCode: string;
    onClickCard: (card:CardId)=>void;
}
function ListElement(props: ListElementProps): React.JSX.Element {
    const [list, setList] = useState<ListHeader | undefined>(undefined);
    const [listTitle, setListTitle] = useState("");
    const [visible, setVisible] = useState(false);
    const [error, setError] = useState("");
    const [cardTitle, setCardTitle] = useState("");
    const clickOutsideRef = useClickOutside(() => onBlur());
    const sockCtx = useSocket();
    const [cardIds, setCardIds] = useState<CardId[]>([]);
    
    useEffect(()=>{
        let strictIgnore = false;
        const fetchListData = async () => {
            await new Promise((resolve)=>setTimeout(resolve, 0));
            if(strictIgnore || !props.listId || !sockCtx.connected || props.isOverlay){
                return;
            }
            try{
                const listRes = await getListData(sockCtx, props.listId);
                setList(listRes);
                setCardIds(listRes?.cardIds ?? []);
                setListTitle(listRes?.name || "");
            } catch(err) {
                notify(NoteType.LIST_DATA_ERROR, err);
                return;
            }
        };
        fetchListData();
        return ()=>{
            strictIgnore = true;
        }
    }, [props.listId, sockCtx.connected]);

    useSocketListener<ServerSE.UPDATE_LIST_FIELD>(ServerSE.UPDATE_LIST_FIELD, (payload)=>{
        if(props.listId !== payload.id){
            return;
        }
        setList((prev)=>{
            if(!prev){
                return prev;
            }
            const updated = updateBaseFromPartial<ListHeader>(prev, payload);
            if(payload.name){
                setListTitle(payload.name);
            }
            return updated;
        });
    });

    useSocketListener<ServerSE.ADD_CARD>(ServerSE.ADD_CARD, (payload)=>{
        if(payload.listId !== props.listId){
            return;
        }
        const ids = cardIds;
        ids.push()
        setCardIds([...cardIds, ])
    });
    
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
            await createCard(sockCtx, props.listId, cardTitle)
        } catch (e) {
            notify(NoteType.CARD_CREATION_ERROR, e);
            return;
        }
        setVisible(false);
    }

    async function onTitleChange(value: string) {
        setListTitle(value);
        try {
            await updateListField(sockCtx, props.listId, {name: value})
        } catch (e: any){
            notify(NoteType.LIST_UPDATE_ERROR, e);
            return;
        }
    }

    async function onArchive() {
       await updateListField(sockCtx, props.listId, {archived: true, order: -1});
    }

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
                minWidth: "250px",
                maxWidth: "250px",
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
                <Text fz="6pt">{props.listId}</Text>
                <EditableTextbox 
                    value={listTitle}
                    onChange={onTitleChange}
                    placeholder="Click to edit!"
                    type="title"
                    titleProps={{order: 6, c: "#ffffff"}}
                    style={{
                        width: "90%",
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
                        <Menu.Label>Settings</Menu.Label>
                        <Menu.Item
                            onClick={onArchive}
                            leftSection={<FaArchive />}
                        >
                            Archive List
                        </Menu.Item>
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
                <SortableContext 
                    items={cardIds}
                    strategy={verticalListSortingStrategy}
                >{
                    cardIds.map((cardId, cardIndex) => {
                        return (
                            <SortableCard
                                key={cardId}
                                cardId={cardId}
                                disabled={false}
                                boardCode={props.boardCode ?? "#"}
                                onClick={()=>props.onClickCard(cardId)}
                            />
                        );
                    })
                }</SortableContext>
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
