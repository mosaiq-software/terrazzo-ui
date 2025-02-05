// Utility
import React from "react";

//Components
import Card from "@trz/components/Card";
import EditableTextbox from "@trz/components/EditableTextbox";
import { Button, Group, Paper, Stack, Title, CloseButton, TextInput, Flex } from "@mantine/core";
import {useClickOutside} from "@mantine/hooks";
import {useState} from "react";

/**BoardList Component
 * 
 * State: none
 * 
 * Props: none
 */

const List = (): React.JSX.Element => {
	const [listTitle, setListTitle] = React.useState("Board List");

	const [visible, setVisible] = useState(false);
	const [error, setError] = useState("");
	const [CardTitle, setCardTitle] = useState("");
	const ref = useClickOutside(() => setVisible(false));

	function onSubmit(){
		//Add logic for websocket later
		if(CardTitle.length < 1){
			setError("Enter a Title")
			return;
		}

		if(CardTitle.length > 50){
			setError("Max 50 characters")
			return;
		}
		console.log(CardTitle);
		setError("")
		setCardTitle("");
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
				<EditableTextbox value={listTitle} onChange={setListTitle} placeholder="Click to edit!" type="title" titleProps={{order:6, c: "#ffffff"}}/>
				<Button variant="subtle" c="#ffffff" h="xs"><Title order={6} c="#ffffff" >•••</Title></Button>
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
					Array.from({ length: (5)}).map((_, index) => (
						<Card key={index} />
					))
				}
				<Group>
					{visible &&
						<Paper bg={"#121314"} w="250" radius="md" shadow="lg" ref={ref}>
							<TextInput placeholder="Enter card title..."
									   value={CardTitle}
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

export default List;
