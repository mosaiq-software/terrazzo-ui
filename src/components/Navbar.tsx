import React from "react"
import { Slot } from "@radix-ui/react-slot"
import { Title, Text } from "@mantine/core"
import { useViewportSize } from "@mantine/hooks"

import "../styles/Navbar.css"
import { r } from "react-router/dist/production/route-data-DuV3tXo2"

// Custom hook that encapsulates a components behaviour 
const useNavbar = () => {
    const [isMobile, setIsMobile] = React.useState(false);
    const { width, height } = useViewportSize();

    function toggleMobileVariant() {
        setIsMobile(!isMobile);
    }

    return {
        isMobile
    }
}

type NavbarType = {
    children?: React.ReactNode;
}

const Navbar = () => {
    return (
        <nav className="trzNavigationMenuRoot">
            <ul className="trzNavigationMenuList">
                <li className="trzNavigationMenuItem">
                    <Title order={1}>Terrazzo</Title>
                </li>
                <li className="trzNavigationMenuItem">
                    <NavbarTrigger>Workspace</NavbarTrigger>
                </li>
                <li className="trzNavigationMenuItem">
                    <NavbarTrigger>Create</NavbarTrigger>
                </li>
            </ul>
            <ul className="trzNavigationMenuList">
                <li className="trzNavigationMenuItem">
                    <NavbarTrigger>Search</NavbarTrigger>
                </li>
                <li className="trzNavigationMenuItem">
                    <NavbarTrigger>Account</NavbarTrigger>
                </li>
            </ul>
        </nav>
    )
}


type AsChildProp<DefaultElementProps> = 
    ({ asChild?: false } & DefaultElementProps) 
  |  { asChild: true; children: React.ReactNode }

type TriggerProp = AsChildProp<React.ButtonHTMLAttributes<HTMLButtonElement>>

const NavbarTrigger = ({asChild, ...props} : TriggerProp) => {
    const Component = asChild ? Slot : "button"

    return <Component className="trzNavigationMenuTrigger" {...props}/> 
}

export default Navbar;
