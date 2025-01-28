//Utility
import React from "react";

//Components
import List from "@trz/components/List";
import { Container, Group } from "@mantine/core";

/**Board Component: Holds different BoardLists
 * 
 * State: none
 * 
 * Props: none
 */

const Board = (): React.JSX.Element => {
	return (
		<Container fluid maw="100%" p="lg" bg="#1d2022">
			<Group h="95%" gap={20} align="flex-start" justify="flex-start" wrap="nowrap">
				<List />
				<List />
				<List />
				<List />
			</Group>
		</Container>
	);
};

export default Board;
