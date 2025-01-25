//Utility
import React from "react";
import {Input, TextInput, Button, Container, Flex} from "@mantine/core";

const createBoardCont = {
    bg: 'blue',
    p: '0',
    h: 600,
    mt:'md',
};

const CreateBoard = (): React.JSX.Element => {
    return (
        <Container {...createBoardCont}>
            <Flex
                bg='gray'
                justify='center'
                align='center'
                direction='column'
                gap='xl'
            >
                <div>
                    Board Name
                    <TextInput placeholder="Board Name" />
                </div>
                <div>
                    Board Abbreviation
                    <Input placeholder="Board Abbreviation" />
                </div>

                <Button variant="filled" color="red">Create Board</Button>

            </Flex>
        </Container>
    )
}

export default CreateBoard;