//Utility
import React from "react";

//Components
import {TextInput, Container, Flex, Button} from "@mantine/core";
import {ContextModalProps} from "@mantine/modals";

const CreateBoard = ({
                         context,
                         id,
                         innerProps,
                     }: ContextModalProps<{ modalBody: string }>): React.JSX.Element => {

    const [boardName, setBoardName] = React.useState("");
    const [boardAbbreviation, setBoardAbbreviation] = React.useState("");

    function onSubmit() {
        console.log('Board Created');
        console.log(boardName);
        console.log(boardAbbreviation);
        context.closeModal(id);
    }

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
                    value={boardName}
                    onChange={(event) => setBoardName(event.currentTarget.value)}
                />
                <TextInput
                    label="Board Abbreviation"
                    placeholder="Board Abbreviation"
                    withAsterisk
                    w={250}
                    value={boardAbbreviation}
                    onChange={(event) => setBoardAbbreviation(event.currentTarget.value)}
                />
            </Flex>

            <Button fullWidth mt="md" onClick={onSubmit}>
                Create Board
            </Button>
        </Container>
    )
}

export const CreateBoardModal = ({
                       context,
                       id,
                       innerProps,
                   }: ContextModalProps<{ modalBody: string }>) => (
    <>
        <CreateBoard context={context} id={id} innerProps={innerProps}/>
    </>
);