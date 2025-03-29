import React, {useState} from "react";
import {Checkbox} from "@mantine/core";

export class ChecklistItem {
    id: string;
    name: string;
    checked: boolean;

    constructor(id: string, name: string, checked: boolean) {
        this.id = id;
        this.name = name;
        this.checked = checked;
    }
}

interface ChecklistProps {
    listName: string,
    listItems?: ChecklistItem[],
    onUpdateCheckbox?: (id: string, checked: boolean) => void
}

const dummyChecklistItems = [
    new ChecklistItem("1", "Item 1", false),
    new ChecklistItem("2", "Item 2", true),
    new ChecklistItem("3", "Item 3", false)
];

export const Checklist = (props: ChecklistProps) => {
    const [listItems, setListItems] = useState(props.listItems ?? dummyChecklistItems);
    // const listItems = props.listItems ?? [];
    //const listItems = dummyChecklistItems;

    const handleCheckboxChange = (id: string, checked: boolean) => {
        const updatedItems = listItems.map(item =>
            item.id === id ? { ...item, checked } : item
        );
        setListItems(updatedItems);
        if (props.onUpdateCheckbox) {
            props.onUpdateCheckbox(id, checked);
        }
    };

    return (
        <div>
            <p>Checklist</p>
            <p>{props.listName}</p>
            <ul>
                {listItems.map((item) => (
                    <li key={item.id}>
                        <Checkbox
                            checked={item.checked}
                            onChange={(event) => handleCheckboxChange(item.id, event.currentTarget.checked)}
                            label={item.name}
                        />
                    </li>
                ))}
            </ul>
            <p>Completion Percent: {listItems.length === 0 ? "No items in list" : `${Math.round((listItems.filter(item => item.checked).length / listItems.length) * 100)}%`}</p>
        </div>
    );
}