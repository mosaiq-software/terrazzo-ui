import React, {useState} from "react";
import {TextInput, Container, Flex, Button} from "@mantine/core";
import {getHotkeyHandler} from "@mantine/hooks";
import {ContextModalProps} from "@mantine/modals";
import {useSocket} from "@trz/contexts/socket-context";
import {useNavigate} from "react-router-dom";
import {NoteType, notify} from "@trz/util/notifications";
import { ProjectId } from "@mosaiq/terrazzo-common/types";
import { createBoard } from "@trz/emitters/all";

const CreateBoard = (props: ContextModalProps<{ modalBody: string, projectId: ProjectId }>): React.JSX.Element => {
    const [boardName, setBoardName] = React.useState("");
    const [boardAbbreviation, setBoardAbbreviation] = React.useState("");
    const [errorName, setErrorName] = useState("");
    const [errorAbv, setErrorAbv] = useState("");
    const sockCtx = useSocket();
    const navigate = useNavigate();

    async function onSubmit() {
        setErrorAbv("");
        setErrorName("");

        if(boardName.length < 1){
            setErrorName("Enter a Title");
            return;
        }
        if(boardName.length > 50){
            setErrorName("Max 50 characters");
            return;
        }
        try {
            const board = await createBoard(sockCtx, boardName, boardAbbreviation, props.innerProps.projectId);
            navigate(`/board/${board}`);
        } catch (e) {
            notify(NoteType.BOARD_CREATION_ERROR, e);
            navigate(`/dashboard`);
        }
        props.context.closeModal(props.id);
    }

    return (
        <Container onKeyDown={getHotkeyHandler([
            ['Enter', onSubmit]
        ])}>
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
                    error={errorName}
                />
                <TextInput
                    label="Board Abbreviation"
                    placeholder="Board Abbreviation"
                    error = {errorAbv}
                    w={250}
                    value={boardAbbreviation}
                    onChange={(event) => setBoardAbbreviation(event.currentTarget.value)}
                />
            </Flex>

            <Button fullWidth mt="md"
                    onClick={onSubmit}>
                Create Board
            </Button>
        </Container>
    )
}

export const CreateBoardModal = (props: ContextModalProps<{ modalBody: string, projectId: ProjectId }>) => (<CreateBoard {...props}/>);