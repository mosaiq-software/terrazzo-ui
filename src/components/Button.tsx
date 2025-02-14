import React from "react"
import { Button } from "@mantine/core"

type TRZButtonProps = {
    children?: React.ReactNode;
    className?: string;
}

const TRZButton = ({children, className, ...props}: TRZButtonProps) => {
    return (
        <Button unstyled className="trzButton" {...props}>{children}</Button>
    )
}

export default TRZButton;
