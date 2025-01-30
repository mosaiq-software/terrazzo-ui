//Utility
import React from "react";
import {TextInput, Container, Flex} from "@mantine/core";

const CreateBoard = (): React.JSX.Element => {
    return (
        <Container>
            <Flex
                direction="column"
                justify="center"
                align="center"
                gap="md"
            >
                <TextInput
                    label="Board Name"
                    placeholder="Board Name"
                    withAsterisk
                    w={250}
                />
                <TextInput
                    label="Board Abbreviation"
                    placeholder="Board Abbreviation"
                    withAsterisk
                    w={250}
                />
            </Flex>
        </Container>
    )
}

export default CreateBoard;