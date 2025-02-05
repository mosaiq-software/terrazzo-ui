import React, { useEffect, useState } from "react";
import ListElement from "@trz/components/ListElement";
import { Container, Group } from "@mantine/core";
import CollaborativeMouseTracker from "@trz/wrappers/collaborativeMouseTracker";
import { useParams } from "react-router-dom";
import { useSocket } from "@trz/util/socket-context";
import CreateList from "@trz/components/CreateList";
import {List} from "@mosaiq/terrazzo-common/types";


const Board = (): React.JSX.Element => {
	const params = useParams();
	const sockCtx = useSocket();
	const [boardData, setBoardData] = useState<any>(null);

	useEffect(() => {
		const fetchBoardData = async () => {
			if (!params.boardId) {
				return;
			}
			const boardData = await sockCtx.getBoardData(params.boardId)
				.catch((err) => {
					console.error(err);
					setBoardData({});
					return
				});
			setBoardData(boardData);
			console.log(boardData);
		};
		fetchBoardData();
	}, [params.boardId, sockCtx.connected]);

	if (!params.boardId) {
		return <div>Board not found</div>;
	}

	return (
		<>
			<Container h="100%" fluid maw="100%" p="lg" bg="#1d2022">
				<Group h="95%" gap={20} align="flex-start" justify="flex-start" wrap="nowrap">
					{
						boardData?.lists?.map((list: List, index: number) => (
							<ListElement key={index} listType={list}/>
						))
					}
					<CreateList/>
				</Group>
			</Container>
			<CollaborativeMouseTracker boardId={params.boardId} />
		</>
	);
};

export default Board;
