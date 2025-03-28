import React from "react";

class ChecklistItem {
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
    listItems?: ChecklistItem[]
}

const dummyChecklistItems = [
    new ChecklistItem("1", "Item 1", false),
    new ChecklistItem("2", "Item 2", true),
    new ChecklistItem("3", "Item 3", false)
];

export const Checklist = (props: ChecklistProps) => {
    // const listItems = props.listItems ?? [];
    const listItems = dummyChecklistItems;

    return (
        <div>
            <p>Checklist</p>
            <p>{props.listName}</p>
            <ul>
                {listItems.map((item) => (
                    <li key={item.id}>
                        <input type="checkbox" checked={item.checked} />
                        {item.name}
                    </li>
                ))}
            </ul>
            <p>Completion Percent: {listItems.length === 0 ? "No items in list" : `${Math.round((listItems.filter(item => item.checked).length / listItems.length) * 100)}%`}</p>
        </div>
    );
}