// Utility
import React, {useState} from "react";

//Components
import CardElement from "@trz/components/CardElement";
import EditableTextbox from "@trz/components/EditableTextbox";
import {Button, Group, Paper, Stack, Title, CloseButton, TextInput, Flex} from "@mantine/core";
import {useClickOutside} from "@mantine/hooks";
import {Card, List} from "@mosaiq/terrazzo-common/types";
import {useSocket} from "@trz/util/socket-context";
import {NoteType, notify} from "@trz/util/notifications";

interface ListElementProps {
    listType: List
}

/**BoardList Component
 *
 * State: none
 *
 * Props: none
 */

function ListElement(props: ListElementProps): React.JSX.Element {
    const [listTitle, setListTitle] = React.useState(props.listType.name || "List Title");

    const [visible, setVisible] = useState(false);
    const [error, setError] = useState("");
    const [cardTitle, setCardTitle] = useState("");
    const ref = useClickOutside(() => setVisible(false));
    const sockCtx = useSocket();


    function onSubmit() {
        setError("")
        setCardTitle("");

        if (cardTitle.length < 1) {
            setError("Enter a Title")
            return;
        }

        if (cardTitle.length > 50) {
            setError("Max 50 characters")
            return;
        }

        sockCtx.addCard(props.listType.id, cardTitle).then((success) => {
            if (!success) {
                notify(NoteType.CARD_CREATION_ERROR);
                return;
            }
        }).catch((err) => {
            console.error(err);
        });
        setVisible(false);
    }

    return (
        <Paper
            bg="#121314"
            //h="90vh"
            w="250"
            radius="md"
            shadow="lg"
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "stretch"
            }}
        >
            <Group
                justify="space-between"
                align="center"
                p="xs"
            >
                <EditableTextbox value={listTitle} onChange={setListTitle} placeholder="Click to edit!" type="title"
                                 titleProps={{order: 6, c: "#ffffff"}}/>
                <Button variant="subtle" c="#ffffff" h="xs"><Title order={6} c="#ffffff">•••</Title></Button>
            </Group>
            <Stack
                mt="md"
                mb="md"
                gap={10}
                mah="75vh"
                flex={1}
                style={{
                    overflowY: "scroll",
                    overflowX: "hidden"

                }}
            >
                {
                    props.listType?.cards.map((card:Card, index) => (
						<CardElement key={index} cardType={card}/>
					))
                }
                <Group>
                    {visible &&
                        <Paper bg={"#121314"} w="250" radius="md" shadow="lg" ref={ref}>
                            <TextInput placeholder="Enter card title..."
                                       value={cardTitle}
                                       onChange={(event) => setCardTitle(event.currentTarget.value)}
                                       error={error}
                                       p="5"
                            />
                            <Flex p='5'>
                                <Button w="150"
                                        variant="light"
                                        onClick={onSubmit}
                                >
                                    Create Card
                                </Button>
                                <CloseButton onClick={() => setVisible((v) => !v)}
                                             size='lg'/>
                            </Flex>
                        </Paper>
                    }
                </Group>
            </Stack>

            {!visible &&
                <Button w="100%"
                        variant="light"
                        onClick={() => setVisible((v) => !v)}
                >
                    Add Card +
                </Button>
            }
        </Paper>
    );
};

export default ListElement;
