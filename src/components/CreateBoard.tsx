//Utility
import React, {useState} from "react";

//Components
import {TextInput, Container, Flex, Button} from "@mantine/core";
import {getHotkeyHandler} from "@mantine/hooks";
import {ContextModalProps} from "@mantine/modals";

const CreateBoard = ({
                         context,
                         id,
                         innerProps,
                     }: ContextModalProps<{ modalBody: string }>): React.JSX.Element => {

    const [boardName, setBoardName] = React.useState("");
    const [boardAbbreviation, setBoardAbbreviation] = React.useState("");
    const [errorBoardName, setErrorBoardName] = useState("");
    const [errorBoardAbv, setErrorBoardAbv] = useState("");

    function onSubmit() {
        //Add logic for websocket later
        setErrorBoardName("");
        setErrorBoardAbv("");

        if(boardName.length < 1){
            setErrorBoardName("Enter a Title");
            if(boardAbbreviation.length < 1){
                setErrorBoardAbv("Enter an abbreviation");
            }
            return;
        }
        if(boardName.length > 50){
            setErrorBoardName("Max 50 characters");
            return;
        }
        if(boardAbbreviation.length < 1){
            setErrorBoardAbv("Enter a Title");
            return;
        }
        if(boardAbbreviation.length > 4){
            setErrorBoardAbv("Max 3 characters");
            return;
        }

        setBoardName("");
        setBoardAbbreviation("");
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
                    data-autofocus
                    error={errorBoardName}
                />
                <TextInput
                    label="Board Abbreviation"
                    placeholder="Board Abbreviation"
                    withAsterisk
                    w={250}
                    value={boardAbbreviation}
                    onChange={(event) => setBoardAbbreviation(event.currentTarget.value)}
                    error={errorBoardAbv}
                />
            </Flex>

            <Button fullWidth mt="md"
                    onClick={onSubmit}
                    onKeyDown={getHotkeyHandler([
                        ['mod+Enter', onSubmit]
                    ])}>
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