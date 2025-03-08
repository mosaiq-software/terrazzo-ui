import React, {useState} from "react";
import {Button, CloseButton, Paper, TextInput, Flex, FocusTrap, Tooltip} from "@mantine/core";
import {useClickOutside, getHotkeyHandler} from "@mantine/hooks";
import {useSocket} from "@trz/util/socket-context";
import {NoteType, notify} from "@trz/util/notifications";
import {DatePickerInput} from "@mantine/dates";

const CreateList = (): React.JSX.Element => {
    const [visible, setVisible] = useState(false);
    const [error, setError] = useState("");
    const [title, setTitle] = useState("");
    //const ref = useClickOutside(() => onBlur());
    const sockCtx = useSocket();

    //temp
    const [startDate, setStartDate] = useState<[Date | null, Date | null]>([null, null]);

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

        if(startDate[0] === null || startDate[1] === null){
            setError("Select a Start and End Date")
            return;
        }

        try {
            await sockCtx.createList(sockCtx.boardData!.id, title, startDate[0], startDate[1])
        } catch (e) {
            notify(NoteType.LIST_CREATION_ERROR, e);
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
                <Button
                    miw="250px"
                    maw="250px"
                    onClick={() => setVisible((v) => !v)}
                    color={"#121314"}
                    justify="left"
                >
                    + Add List
                </Button>
            }
            {visible &&
                <Paper
                    bg={"#121314"}
                    w="250"
                    radius="md"
                    shadow="lg"
                    onKeyDown={getHotkeyHandler([
                        ['Enter', onSubmit],
                        ['Escape', onBlur]
                    ])}
                >
                    <FocusTrap>
                        <TextInput
                            label="Enter list title"
                            placeholder="List Title"
                            value={title}
                            onChange={(event) => setTitle(event.currentTarget.value)}
                            error={error}
                            p="xs"
                            pb="0"
                        />
                    </FocusTrap>
                    <DatePickerInput
                        type="range"
                        label="Select Sprint Range"
                        placeholder="Start - End"
                        p="xs"
                        pb="0"
                        value={startDate}
                        onChange={setStartDate}
                    />
                    <Flex
                        p="xs"
                        justify="space-between"
                        align="center"
                    >
                        <Button
                            w="150"
                            variant="light"
                            color="gray"
                            onClick={onSubmit}
                        >
                            Create List
                        </Button>
                        <Tooltip
                            label={"Cancel List Creation"}
                        >
                            <CloseButton
                            onClick={onBlur}
                            size='lg'
                            />
                        </Tooltip>
                    </Flex>
                </Paper>
            }
        </>
    );
}

export default CreateList;