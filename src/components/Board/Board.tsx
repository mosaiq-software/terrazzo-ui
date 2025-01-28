//Utility
import React from "react";

//Components
import BoardList from "../BoardList/BoardList";
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
				<BoardList />
				<BoardList />
				<BoardList />
				<BoardList />
			</Group>
		</Container>
	);
};

export default Board;
