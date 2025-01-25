import React from "react";
import './../styles/NavBar.css'

type NavBarProps = { 
    children?: React.ReactNode;
}

const NavBar = (props: NavBarProps) => {
    const styles = { 
        "--mosi-navbar-height": "calc(2.2 * var(--mantine-h1-font-size))" 
    } as React.CSSProperties
    return (
        <nav className="mosi-navbar" style={styles}>
            <div className="mosi-navbar-nav">{props.children}</div>
        </nav>
    );
}

export default NavBar;
