import { Button, type ButtonProps } from "@mantine/core"

import "@trz/styles/TRZButton.css"

interface TRZButtonProps extends ButtonProps {}

const TRZButton = ({children, className, ...props}: TRZButtonProps) => {

  return (
    <Button unstyled className={"trzButton"} {...props}>
      {children}
    </Button>
  )
}

export default TRZButton;
