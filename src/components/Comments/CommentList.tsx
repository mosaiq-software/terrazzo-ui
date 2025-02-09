import React, {useState} from "react";
import {Button, Paper, Stack, Title, CloseButton, TextInput, Flex} from "@mantine/core";
import {useClickOutside} from "@mantine/hooks";
import CommentCard from "./CommentCard";

const CommentList = ({comments, onAddComment}) => {
    const [visible, setVisible] = useState(false);
    const [error, setError] = useState("");
    const [commentText, setCommentText] = useState("");
    const ref = useClickOutside(() => setVisible(false));

    function onSubmit() {
        if (commentText.length < 1) {
            setError("Enter a comment");
            return;
        }

        if (commentText.length > 200) {
            setError("Max 200 characters");
            return;
        }

        onAddComment(commentText);
        setError("");
        setCommentText("");
        setVisible(false);
    }

    return (
        <Paper
            p="md"
            withBorder mx="md"
            w="94%"
            radius="md"
            shadow="lg"
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "stretch",
                maxHeight: "50vh",
                overflow: "hidden"
            }}
        >
            <Title order={6} c="#000000" p="xs">Comments</Title>
            <Stack
                mt="sm"
                mb="sm"
                gap={8}
                mah="75vh"
                flex={1}
                style={{
                    overflowY: "auto",
                    overflowX: "hidden"
                }}
            >
                {comments.map((comment, index) => (
                    <CommentCard key={index} {...comment} />
                ))}
                {visible && (
                    <Paper w="100%" radius="md" shadow="lg" ref={ref}>
                        <TextInput
                            placeholder="Enter your comment..."
                            value={commentText}
                            onChange={(event) => setCommentText(event.currentTarget.value)}
                            error={error}
                            p="5"
                        />
                        <Flex p='5'>
                            <Button
                                w="100%"
                                variant="light"
                                onClick={onSubmit}
                            >
                                Add Comment
                            </Button>
                            <CloseButton onClick={() => setVisible((v) => !v)} size='lg'/>
                        </Flex>
                    </Paper>
                )}
            </Stack>
            {!visible && (
                <Button
                    w="100%"
                    h="10vh"
                    variant="light"
                    onClick={() => setVisible((v) => !v)}
                >
                    Add Comment +
                </Button>
            )}
        </Paper>
    );
};

export default CommentList;
