import React from "react";
import {Text, Title, Input, TitleProps, TextProps, InputProps} from "@mantine/core";

interface EditableTextboxProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: "text" | "title";
    titleProps?: TitleProps;
    textProps?: TextProps;
    inputProps?: InputProps;
}
const EditableTextbox = (props: EditableTextboxProps) => {
    const { value, onChange, titleProps, textProps, inputProps } = props;
    const [editingValue, setEditingValue] = React.useState<string|null>(null);

    const onSaveChanges = () => {
        if (editingValue !== null) {
            onChange(editingValue);
            setEditingValue(null);
        }
    };

    const onDiscardChanges = () => {
        setEditingValue(null);
    };

    const onEdit = () => {
        setEditingValue(value);
    };

    if(editingValue === null) {
        if(!value) {
            if(titleProps) titleProps.c = "#878787";
            if(textProps) textProps.c = "#878787";
        }
        if(props.type === "title") {
            return (
                <Title onClick={onEdit} {...titleProps}  >{value || props.placeholder}</Title>
            );
        } else {
            return (
                <Text onClick={onEdit} {...textProps}>{value || props.placeholder}</Text>
            );
        }
    }

    return (
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
    );
}
export default EditableTextbox;