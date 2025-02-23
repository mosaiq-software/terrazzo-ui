import React, {useState} from "react";
import {TextInput, Container, Flex, Button} from "@mantine/core";
import {getHotkeyHandler} from "@mantine/hooks";
import {ContextModalProps} from "@mantine/modals";
import {useSocket} from "@trz/util/socket-context";
import {useNavigate, useParams} from "react-router-dom";
import {NoteType, notify} from "@trz/util/notifications";
import { OrganizationId } from "@mosaiq/terrazzo-common/types";

const CreateProject = (props: ContextModalProps<{ modalBody: string, orgId: OrganizationId}>): React.JSX.Element => {
    const [projectName, setProjectName] = React.useState("");
    const [errorName, setErrorName] = useState("");
    const params = useParams();
    const sockCtx = useSocket();
    const navigate = useNavigate();

    async function onSubmit() {
        setErrorName("");

        if(projectName.length < 1){
            setErrorName("Enter a Title");
            return;
        }
        if(projectName.length > 50){
            setErrorName("Max 50 characters");
            return;
        }
        try {
            const projectId = await sockCtx.createProject(projectName, props.innerProps.orgId);
            navigate(`/project/${projectId}`);
        } catch (e) {
            console.error(e);
            navigate(`/dashboard`);
            notify(NoteType.PROJECT_CREATION_ERROR);
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
                    label="Project Name"
                    placeholder="My New Project"
                    withAsterisk
                    w={250}
                    value={projectName}
                    onChange={(event) => setProjectName(event.currentTarget.value)}
                    data-autofocus
                    error={errorName}
                />
            </Flex>

            <Button fullWidth mt="md"
                    onClick={onSubmit}>
                Create Project
            </Button>
        </Container>
    )
}

export const CreateProjectModal = (props: ContextModalProps<{ modalBody: string, orgId: OrganizationId }>) => (<CreateProject {...props}/>);