import React from "react"
import { NavLink } from "@mantine/core"
import { useWindowScroll } from "@mantine/hooks"

import "@trz/styles/Navbar.css"
import TRZButton from  "@trz/components/Button";

// Custom hook that encapsulates a components behaviour 
const useNavbar = () => {
    const [scroll, scrollTo] = useWindowScroll();
    const [isTop, setIsTop] = React.useState( true );

    return { 
        scroll
    }
}

const Navbar = () => {
    return (
        <header className="trzNavigationMenuRoot">
            <ul className="trzNavigationMenuList">
                <li className="trzNavigationMenuItem">
                    <NavLink
                        unstyled
                        className="trzNavLink"
                        label="Terrazzo"
                    />
                </li>
                <li className="trzNavigationMenuItem">
                    <TRZButton>Workspace</TRZButton>
                </li>
                <li className="trzNavigationMenuItem">
                    <TRZButton>Create</TRZButton>
                </li>
            </ul>
            <ul className="trzNavigationMenuList">
                <li className="trzNavigationMenuItem">
                    <TRZButton>Search</TRZButton>
                </li>
                <li className="trzNavigationMenuItem">
                    <TRZButton>Account</TRZButton>
                </li>
            </ul>
        </header>
    )
}


export default Navbar;
