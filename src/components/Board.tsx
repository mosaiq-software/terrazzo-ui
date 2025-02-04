import React, { useEffect, useState } from "react";
import List from "@trz/components/List";
import { Container, Group } from "@mantine/core";
import CollaborativeMouseTracker from "@trz/wrappers/collaborativeMouseTracker";
import { useParams } from "react-router-dom";
import { useSocket } from "@trz/util/socket-context";

const Board = (): React.JSX.Element => {
	const params = useParams();
	const sockCtx = useSocket();
	const [boardData, setBoardData] = useState<any>(null);

	useEffect(() => {
		const fetchBoardData = async () => {
			if (!params.boardId) {
				return;
			}
			const boardData = await sockCtx.getBoardData(params.boardId);
			setBoardData(boardData);
		};
		fetchBoardData();
	}, [params.boardId, sockCtx.connected]);

	if (!params.boardId) {
		return <div>Board not found</div>;
	}

	return (
		<>
			<Container fluid maw="100%" p="lg" bg="#1d2022">
				<Group h="95%" gap={20} align="flex-start" justify="flex-start" wrap="nowrap">
					<List />
					<List />
					<List />
					<List />
				</Group>
			</Container>
			<CollaborativeMouseTracker boardId={params.boardId} />
		</>
	);
};

export default Board;
