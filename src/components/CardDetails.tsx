//Utility
import React, {useState} from "react";
import {
    Select,
    Textarea,
    Avatar,
    Group,
    Grid,
    Stack,
    Button,
    Menu,
    Modal,
    Text,
    MultiSelect,
} from "@mantine/core";

import CommentList from "@trz/components/Comments/CommentList";

/**ListCardDetails Component
 *
 * State: none
 *
 * Props: {
 * id => unique id that maps to Terrazzo database
 * toggle => toggle function passed from ListCard parent
 * }
 */

interface CardDetailsProps {
    id: number;
    toggle: () => void;
    open: boolean;
}

const CardDetails = (props: CardDetailsProps): React.JSX.Element => {
    //Replace the below information with data returned by call to API getting specific card information based on cardId above.
    const members = ["Member 1", "Member 2", "Member 3"];
    const labels = ["label 1", "label 2", "label 3"];
    const cardNumber = "abc123";
    const description = "";
    const activity = "";

    const iconComponents = members.map((member) => <Avatar>{member[0]}</Avatar>);

    const [comments, setComments] = useState([
        {avatarSrc: "test.jpg", name: "Zach", time: "5 minutes ago", comment: "Hi"},
        {avatarSrc: "test.jpg", name: "Bob", time: "10 minutes ago", comment: "Hello"},
        {avatarSrc: "test.jpg", name: "Bob", time: "10 minutes ago", comment: "Hello"},
        {avatarSrc: "test.jpg", name: "Bob", time: "10 minutes ago", comment: "Hello"},
    ]);

    const handleAddComment = (newCommentText) => {
        const newComment = {
            avatarSrc: "",
            name: "Current User",
            time: "Just now",
            comment: newCommentText,
        };
        setComments([newComment, ...comments]);
    };

    return (
        <Modal
            opened={props.open}
            onClose={props.toggle}
            title='Terrazzo'
            size='50%'
            overlayProps={{backgroundOpacity: 0.5, blur: 3}}>
            <Stack style={{borderTop: "1px solid var(--mantine-color-gray-8"}}>
                <Group grow preventGrowOverflow={false} wrap='nowrap' align="flex-start">
                    <Stack style={{borderRight: " 1px solid var(--mantine-color-gray-8", width: "70%"}}>
                        <Grid style={{borderBottom: "1px solid var(--mantine-color-gray-8", padding: "1rem"}}>
                            <Grid.Col span={4}>
                                <Stack align='left'>
                                    <Text fz="sm">Members</Text>
                                    <Group>
                                        <Avatar.Group>
                                            {iconComponents}
                                            <Avatar>+</Avatar>
                                        </Avatar.Group>
                                    </Group>
                                </Stack>
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <Stack align='left'>
                                    <Text fz="sm">Card Number</Text>
                                    <Text fz="sm">{cardNumber}</Text>
                                </Stack>
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <Stack align='left'>
                                    <Select label='Priority' placeholder='Low' data={["Low", "Medium", "High"]}/>
                                </Stack>
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <Stack align='left'>
                                    <MultiSelect label='Labels' data={labels} style={{margin: ".2rem"}}/>
                                </Stack>
                            </Grid.Col>
                        </Grid>

                        <Textarea label='Description' autosize maxRows={4} minRows={4} style={{padding: "1rem"}}/>
                        <Textarea label='Activity' autosize maxRows={4} minRows={4} style={{padding: "1rem"}}/>

                        <CommentList
                            autosize
                            comments={comments}
                            onAddComment={handleAddComment}
                            title="Comments"
                            style={{padding: "1rem"}}
                        />

                    </Stack>
                    <Stack justify='flex-start' align='stretch' pt="md">
                        <Menu>
                            <Menu.Target>
                                <Button bg='gray.8'>Menu 1</Button>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Label>Placeholder 1</Menu.Label>
                                <Menu.Item>Placeholder 1 Item</Menu.Item>
                                <Menu.Label>Placeholder 2</Menu.Label>
                                <Menu.Item>Placeholder 2 Item</Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Stack>
                </Group>
            </Stack>
        </Modal>
    );
};

export default CardDetails;
