import React, {useEffect, useState} from "react";
import ListElement from "@trz/components/ListElement";
import {Container, Group} from "@mantine/core";
import CollaborativeMouseTracker from "@trz/wrappers/collaborativeMouseTracker";
import {useNavigate, useParams} from "react-router-dom";
import {useSocket} from "@trz/util/socket-context";
import CreateList from "@trz/components/CreateList";
import {Board, List} from "@mosaiq/terrazzo-common/types";
import {NoteType, notify} from "@trz/util/notifications";


const BoardElement = (): React.JSX.Element => {
	const params = useParams();
	const sockCtx = useSocket();

	const navigate = useNavigate();

	useEffect(() => {
		const fetchBoardData = async () => {
			if (!params.boardId) {
				return;
			}
			await sockCtx.getBoardData(params.boardId)
				.catch((err) => {
					console.error(err);
					navigate("/dashboard");
					notify(NoteType.BOARD_DATA_ERROR);
					return
				});
		};
		fetchBoardData();
	}, [params.boardId, sockCtx.connected]);

	if (!params.boardId) {
		return <div>Board not found</div>;
	}

	return (
		<>
			<Container 
				h="100%" 
				fluid 
				maw="100%" 
				p="lg" 
				bg="#1d2022"
			>
				<Group 
					h="95%"
					gap={20}
					align="flex-start"
					justify="flex-start"
					wrap="nowrap"
					style={{
						overflowX: "scroll"
					}}
				>
					{
						sockCtx.boardData?.lists?.map((list: List, index: number) => (
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

export default BoardElement;
