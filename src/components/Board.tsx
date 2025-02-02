//Utility
import React, { useEffect } from "react";

//Components
import List from "@trz/components/List";
import { Container, Group } from "@mantine/core";
import CollaborativeMouseTracker from "@trz/wrappers/collaborativeMouseTracker";
import { useLocation } from "react-router-dom";
import { useSocket } from "@trz/util/socket-context";

/**Board Component: Holds different BoardLists
 * 
 * State: none
 * 
 * Props: none
 */

const Board = (): React.JSX.Element => {
	const location = useLocation();
	const sockCtx = useSocket();

	if (!location){
		return <p>Board not found</p>;
	}

	useEffect(() => {
		sockCtx.setRoom(location.pathname);
	}, [sockCtx, location]);

	return (
		<>
			<Container h="100%" fluid maw="100%" p="lg" bg="#1d2022">
				<Group h="95%" gap={20} align="flex-start" justify="flex-start" wrap="nowrap">
					<List />
					<List />
					<List />
					<List />
				</Group>
			</Container>
			<CollaborativeMouseTracker />
		</>
	);
};

export default Board;
