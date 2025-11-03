import { ActionIcon, Button, Divider, Menu, Portal, Stack, Tooltip } from "@mantine/core";
import { Card } from "@mosaiq/terrazzo-common/types";
import { useSocket } from "@trz/contexts/socket-context";
import { useTRZ } from "@trz/contexts/TRZ-context";
import { updateCardsLabels } from "@trz/emitters/all";
import { colorIsDarkAdvanced } from "@trz/util/colorUtils";
import React from "react";
import { FaArchive } from "react-icons/fa";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { MdAccountBox, MdCheck, MdLabel } from "react-icons/md";
import { useNavigate } from "react-router";
import { LabelDisplay } from "./CardDetails/LabelsMenu";

interface CardContextMenuProps {
    card: Card;
    open: boolean;
    onClose: () => void;
    x?: number;
    y?: number;
}
export const CardContextMenu = (props: CardContextMenuProps) => {
    if (!props.open) {
        return null;
    }

    return (
        <Portal>
            {/* Invisible backdrop to capture clicks outside the menu */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 9998,
                }}
                onClick={(e)=>{
                    e.preventDefault();
                    e.stopPropagation();
                    props.onClose();
                }}
            />
            
            {/* The actual context menu */}
            <div
                style={{
                    position: 'fixed',
                    left: props.x || 0,
                    top: props.y || 0,
                    zIndex: 9999,
                    background: 'white',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    padding: '4px',
                    minWidth: '150px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
            >
                <Stack gap="0" justify="start">
                    <CtxLabelsMenu card={props.card} />
                    <CtxMenuButton
                        icon={<FaArchive size={16} />}
                        text="Archive"
                        onClick={() => {
                            props.onClose();
                        }}
                    />
                </Stack>
            </div>
        </Portal>
    );
}

interface CtxMenuButtonProps {
    icon: any;
    text: string;
    onClick: ()=>void;
}
const CtxMenuButton = (props: CtxMenuButtonProps)=>{
    return (
        <Button
            w="100%"
            fullWidth
            justify="start"
            variant="subtle"
            leftSection={props.icon}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                props.onClick()
            }}
        >
            {props.text}
        </Button>
    )
}

interface CtxLabelsMenuProps {
    card: Card;
}

export const CtxLabelsMenu = (props: CtxLabelsMenuProps) => {
    const trzCtx = useTRZ();
    const sockCtx = useSocket();

    if(!trzCtx.boardData?.labels.length){
        return null;
    }
    
    return (
        <Menu
            position='right'
            withArrow
            arrowPosition="side"
            closeOnClickOutside={true}
            trigger="hover"
            closeDelay={200}
        >
            <Menu.Target>
                <CtxMenuButton
                    icon={<MdLabel size={16}/>}
                    text="Labels"
                    onClick={()=>{

                    }}
                />
            </Menu.Target>
            <Menu.Dropdown ta='center' miw="10rem">
                <Menu.Label>Labels</Menu.Label>
                <Stack gap={1}>
                {
                    trzCtx.boardData?.labels.map(label=>{
                        const textColor = colorIsDarkAdvanced(label.color) ? "#fff" : "#000";
                        return (
                            <Button
                                key={label.id}
                                bg={label.color}
                                ta='left'
                                justify='start'
                                c={textColor}
                                style={{
                                    borderRadius:"4px",
                                }}
                                leftSection={
                                    <MdCheck style = {{
                                        visibility: props.card.labels.includes(label.id) ? "visible" : "hidden"
                                    }}/>
                                }
                                onClick={()=>{
                                    const labels = props.card.labels;
                                    if(labels.includes(label.id)){
                                        labels.splice(labels.indexOf(label.id), 1);
                                    } else {
                                        labels.push(label.id);
                                    }
                                    updateCardsLabels(sockCtx, props.card.id, labels);
                                }}
                            >
                                {label.name}
                            </Button>
                        )
                    })
                }
                </Stack>
            </Menu.Dropdown>
        </Menu>
    )
}