import React, { CSSProperties } from "react";
import {Text, Title, Input, TitleProps, TextProps, InputProps} from "@mantine/core";
import {captureAllEvents, captureDraggableEvents, captureEvent, forAllClickEvents} from '@trz/util/eventUtils';

interface EditableTextboxProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: "text" | "title";
    titleProps?: TitleProps;
    textProps?: TextProps;
    inputProps?: InputProps;
    style?: CSSProperties;
}
const EditableTextbox = (props: EditableTextboxProps) => {
    const { value, onChange, placeholder, type, titleProps, textProps, inputProps, style } = props;
    const [editingValue, setEditingValue] = React.useState<string|null>(null);

    const onSaveChanges = () => {
        if (editingValue !== null) {
            onChange(editingValue.trim());
            setEditingValue(null);
        }
    };

    const onDiscardChanges = () => {
        setEditingValue(null);
    };

    const onEdit = (e) => {
        captureEvent(e);
        setEditingValue(value);
    };

    return (
        <div
            {...captureDraggableEvents(captureEvent, forAllClickEvents(onEdit))}
            style={style}
        >
            {
                editingValue !== null &&
                <Input
                    value={editingValue}
                    onChange={(event) => setEditingValue(event.currentTarget.value)}
                    onBlur={onSaveChanges}
                    autoFocus
                    onKeyDown={(event) => {
                        if(event.key === "Enter") {
                            onSaveChanges();
                        } else if(event.key === "Escape") {
                            onDiscardChanges();
                        }
                    }}
                    {...inputProps}
                />
            }
            {
                editingValue === null &&
                type === "title" &&
                <Title {...titleProps} >{value || placeholder}</Title>
            }
            {
                editingValue === null &&
                type === "text" &&
                <Text {...textProps} >{value || placeholder}</Text>
            }
        </div>
        
    );
}
export default EditableTextbox;