//Utility
import React, {useState} from "react";

//Components
import {Button, CloseButton, Paper, TextInput, Flex, FocusTrap} from "@mantine/core";
import {useClickOutside, getHotkeyHandler} from "@mantine/hooks";
import {useSocket} from "@trz/util/socket-context";
import {NoteType, notify} from "@trz/util/notifications";


const CreateList = (): React.JSX.Element => {

    const [visible, setVisible] = useState(false);
    const [error, setError] = useState("");
    const [title, setTitle] = useState("");
    const ref = useClickOutside(() => onBlur());
    const sockCtx = useSocket();

    async function onSubmit(){
        setError("")
        setTitle("");
        if(title.length < 1){
            setError("Enter a Title")
            return;
        }

        if(title.length > 50){
            setError("Max 50 characters")
            return;
        }
        try {
            await sockCtx.addList(sockCtx.boardData!.id, title)
        } catch (e) {
            notify(NoteType.LIST_CREATION_ERROR);
            console.error(e);
            return;
        } 
        setVisible(false);
    }

    function onBlur(){
        setTitle("");
        setError("");
        setVisible((v) => !v)
    }

    return (
        <>
            {!visible &&
                <Button miw="250px"
                        maw="250px"
                        onClick={() => setVisible((v) => !v)}
                        color={"#121314"}
                        justify="left"
                >
                    + Add List
                </Button>
            }
            {visible &&
                <Paper bg={"#121314"}
                       w="250"
                       radius="md"
                       shadow="lg"
                       ref={ref}
                       onKeyDown={getHotkeyHandler([
                           ['Enter', onSubmit]
                ])}>
                    <FocusTrap>
                        <TextInput placeholder="Enter list title..."
                                   value={title}
                                   onChange={(event) => setTitle(event.currentTarget.value)}
                                   error={error}
                                   p="5"
                        />
                    </FocusTrap>
                    <Flex p='5'>
                        <Button w="150"
                                variant="light"
                                onClick={onSubmit}
                        >
                            Create List
                        </Button>
                        <CloseButton onClick={onBlur}
                                     size='lg'/>
                    </Flex>
                </Paper>
            }
        </>
    );
}

export default CreateList;