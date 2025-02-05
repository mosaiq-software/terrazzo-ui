//Utility
import React from "react";

//Components
import {Button, CloseButton, Paper, TextInput, Flex} from "@mantine/core";
import {useClickOutside} from "@mantine/hooks";
import {useState} from "react";

const CreateList = (): React.JSX.Element => {

    const [visible, setVisible] = useState(false);
    const [error, setError] = useState("");
    const [title, setTitle] = useState("");
    const ref = useClickOutside(() => setVisible(false));

    function onSubmit(){
        //Add logic for websocket later
        if(title.length < 1){
            setError("Enter a Title")
            return;
        }

        if(title.length > 50){
            setError("Max 50 characters")
            return;
        }
        console.log(title);
        setError("")
        setTitle("");
        setVisible(false);
    }

    return (
        <>
            {!visible &&
                <Button w="250"
                        onClick={() => setVisible((v) => !v)}
                        color={"#121314"}
                >
                    + Add List
                </Button>
            }
            {visible &&
                <Paper bg={"#121314"} w="250" radius="md" shadow="lg" ref={ref}>
                    <TextInput placeholder="Enter list title..."
                               value={title}
                               onChange={(event) => setTitle(event.currentTarget.value)}
                               error={error}
                               p="5"
                    />
                    <Flex p='5'>
                        <Button w="150"
                                variant="light"
                                onClick={onSubmit}
                        >
                            Create List
                        </Button>
                        <CloseButton onClick={() => setVisible((v) => !v)}
                                     size='lg'/>
                    </Flex>
                </Paper>
            }
        </>
    );
}

export default CreateList;