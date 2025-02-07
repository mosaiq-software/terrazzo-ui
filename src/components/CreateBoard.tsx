//Utility
import React, {useState} from "react";

//Components
import {TextInput, Container, Flex, Button} from "@mantine/core";
import {ContextModalProps} from "@mantine/modals";
import {useSocket} from "@trz/util/socket-context";
import {useNavigate} from "react-router-dom";
import {NoteType, notify} from "@trz/util/notifications";

const CreateBoard = ({
                         context,
                         id,
                         innerProps,
                     }: ContextModalProps<{ modalBody: string }>): React.JSX.Element => {

    const [boardName, setBoardName] = React.useState("");
    const [boardAbbreviation, setBoardAbbreviation] = React.useState("");
    const [errorName, setErrorName] = useState("");
    const [errorAbv, setErrorAbv] = useState("");
    const sockCtx = useSocket();
    const navigate = useNavigate();

    function onSubmit() {
        setErrorAbv("");
        setErrorName("");

        if(boardName.length < 1 ){
            setErrorName("Enter a Name")
            return;
        }

        if(boardName.length > 50 ){
            setErrorName("Max 50 characters")
            return;
        }

        if(boardAbbreviation.length < 1){
            setErrorAbv("Enter an Abbreviation")
            return;
        }

        if(boardAbbreviation.length > 3){
            setErrorAbv("Max 3 characters")
            return;
        }

        sockCtx.createBoard(boardName, boardAbbreviation).then((board) => {
            console.log(board);
            navigate(`/boards/${board}`);
            context.closeModal(id);
        }).catch((err) => {
            console.error(err);
            navigate(`/dashboard`);
            notify(NoteType.BOARD_CREATION_ERROR);
        });
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
                    error = {errorName}
                    w={250}
                    value={boardName}
                    onChange={(event) => setBoardName(event.currentTarget.value)}
                />
                <TextInput
                    label="Board Abbreviation"
                    placeholder="Board Abbreviation"
                    withAsterisk
                    error = {errorAbv}
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