import React from 'react';
import "./../styles/DropDown.css"

interface DropDownProps { 
    children?: React.ReactNode[];
    fullScreen?: Boolean;
}

const DropDown = (props: DropDownProps) => {
    return (
        <ul className="trz-dropdown">
            { (!props.children) ? <></> :

                props.children.map((child: React.ReactNode, index: number): React.ReactNode => {
                    const key = `trz-dd${index}`;
                    return (
                        <li key={key} className="trz-dropdown-item">
                            {child}
                        </li>
                    )
                })
            }
        </ul>
    );
}

export default DropDown;
