import React from "react"
import { Slot } from "@radix-ui/react-slot"
import { AvatarIcon } from "@tabler/icons-react"
import { Title, ActionIcon, Button, Autocomplete } from "@mantine/core"
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


const Navbar = () => {
    const [value, setValue] = React.useState("");

    return (
        <nav className="trzNavigationMenuRoot">
            <ul className="trzNavigationMenuList">
                <li className="trzNavigationMenuItem">
                    <Title order={3}>Terrazzo</Title>
                </li>
            </ul>
            <ul className="trzNavigationMenuList">
                <li className="trzNavigationMenuItem">
                    <Autocomplete
                        placeholder="Search"
                        value={value}
                        onChange={setValue}/>
                </li>
                <li className="trzNavigationMenuItem">
                    <NavbarTrigger asChild>
                        <ActionIcon 
                            variant="unstyled"
                            size="lg"
                            radius="100"
                            aria-label="Account">
                            T
                        </ActionIcon>
                    </NavbarTrigger>
                </li>
            </ul>
        </nav>
    )
}


type AsChildProp<DefaultElementProps> = 
  |  ({ asChild?: false } & DefaultElementProps) 
  |   { asChild: true; children: React.ReactNode}

type TriggerProp = AsChildProp<React.ButtonHTMLAttributes<HTMLButtonElement>>

const NavbarTrigger = ({asChild, ...props} : TriggerProp) => {
    const Component = asChild ? Slot : "button"
    return <Component className="trzNavigationMenuTrigger" {...props}/> 
}

export default Navbar;
