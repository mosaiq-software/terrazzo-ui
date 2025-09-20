import React, {useState} from "react";
import {TextInput, Container, Flex, Button, Space, Text, FileInput, Fieldset} from "@mantine/core";
import {getHotkeyHandler} from "@mantine/hooks";
import {ContextModalProps} from "@mantine/modals";
import {useSocket} from "@trz/contexts/socket-context";
import {useNavigate} from "react-router-dom";
import {NoteType, notify} from "@trz/util/notifications";
import { ProjectId } from "@mosaiq/terrazzo-common/types";
import { createBoard } from "@trz/emitters/all";
import { callTrzApi } from "@trz/util/apiUtils";
import { RestRoutes } from "@mosaiq/terrazzo-common/apiTypes";
import { TrelloExportType } from "@mosaiq/terrazzo-common/trelloTypes";

const CreateBoard = (props: ContextModalProps<{ modalBody: string, projectId: ProjectId }>): React.JSX.Element => {
    const [boardName, setBoardName] = React.useState("");
    const [boardAbbreviation, setBoardAbbreviation] = React.useState("");
    const [errorName, setErrorName] = useState("");
    const [errorAbv, setErrorAbv] = useState("");
    const [trelloImport, setTrelloImport] = useState<File | null>(null);
    const [trelloImportStatus, setTrelloImportStatus] = useState<string>("Upload");
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

    async function handleImportFromTrello() {
        try {
            if(!trelloImport){
                throw new Error("No file provided");
            }
            setTrelloImportStatus("Uploading... This may take some time")
            const text = await trelloImport.text()
            const json = JSON.parse(text) as TrelloExportType;
            const res = await callTrzApi(RestRoutes.IMPORT_FROM_TRELLO, {projectId: props.innerProps.projectId}, json)
            setTrelloImportStatus("Loading...")
            await new Promise((r)=>setTimeout(r, 2000));
            navigate(`/board/${res}`);
        } catch (e:any){
            notify(NoteType.BOARD_CREATION_ERROR, e);
        }
        setTrelloImportStatus("Upload")
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
            <Space/>
            <Text ta="center" py="md">or</Text>
            <Fieldset>
                <FileInput
                    label="Import from Trello"
                    placeholder="board.json"
                    accept="application/json"
                    clearable
                    value={trelloImport}
                    onChange={setTrelloImport}
                />
                <Button
                    fullWidth
                    mt="md"
                    onClick={handleImportFromTrello}
                    disabled={!trelloImport}
                >
                    {trelloImportStatus}
                </Button>
            </Fieldset>
        </Container>
    )
}

export const CreateBoardModal = (props: ContextModalProps<{ modalBody: string, projectId: ProjectId }>) => (<CreateBoard {...props}/>);