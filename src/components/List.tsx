// Utility
import React from "react";

//Components
import ListCard from "@trz/components/ListCard";
import EditableTextbox from "@trz/components/EditableTextbox";
import { Button, Group, Paper, Stack, Title } from "@mantine/core";

/**BoardList Component
 * 
 * State: none
 * 
 * Props: none
 */

const List = (): React.JSX.Element => {
	const [listTitle, setListTitle] = React.useState("Board List");
	return (
		<Paper 
			bg="#121314" 
			h="90vh" 
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
				mah="90%" 
				flex={1} 
				style={{ 
					overflowY: "scroll", 
					overflowX: "hidden"
					
				}}
			>
				{
					Array.from({ length: (Math.floor(Math.random()*20)) }).map((_, index) => (
						<ListCard key={index} />
					))
				}

			</Stack>
			<Button w="100%" variant="light">Add Card +</Button>
		</Paper>
	);
};

export default List;
