import React, {useEffect, useState} from "react";
import ListElement from "@trz/components/ListElement";
import {Box, Container, Group} from "@mantine/core";
import CollaborativeMouseTracker from "@trz/wrappers/collaborativeMouseTracker";
import {useNavigate, useParams} from "react-router-dom";
import {useSocket} from "@trz/util/socket-context";
import CreateList from "@trz/components/CreateList";
import {Board, List} from "@mosaiq/terrazzo-common/types";
import {NoteType, notify} from "@trz/util/notifications";
import Droppable from '@trz/components/DragAndDrop/Droppable';
import Draggable from "./DragAndDrop/Draggable";


const BoardElement = (): React.JSX.Element => {
	const params = useParams();
	const sockCtx = useSocket();
	const navigate = useNavigate();
	const [testLists, setTestLists] = useState<List[]|undefined>([
		{
			"id": "07cafb44-82fc-4392-a4a5-173ed85d75fc",
			"boardId": "08a0c2df-b58c-44bf-a84b-5bd3930a1999",
			"name": "test",
			"archived": false,
			"order": 1,
			"cards": []
		},
		{
			"id": "09e0601c-89ca-4e8c-85b6-015b668d99db",
			"boardId": "08a0c2df-b58c-44bf-a84b-5bd3930a1999",
			"name": "test 2",
			"archived": false,
			"order": 2,
			"cards": []
		},
		{
			"id": "e1742347-0f28-4fe8-b3b8-de3c93a10062",
			"boardId": "08a0c2df-b58c-44bf-a84b-5bd3930a1999",
			"name": "a",
			"archived": false,
			"order": 3,
			"cards": []
		},
		{
			"id": "dafadb81-1d79-4617-ae56-e522afaf394c",
			"boardId": "08a0c2df-b58c-44bf-a84b-5bd3930a1999",
			"name": "b",
			"archived": false,
			"order": 4,
			"cards": []
		},
		{
			"id": "9bf901ca-9f27-4d02-92e6-c69f7bab9420",
			"boardId": "08a0c2df-b58c-44bf-a84b-5bd3930a1999",
			"name": "c",
			"archived": false,
			"order": 5,
			"cards": []
		},
		{
			"id": "43aa97f6-be50-4352-a1cf-bd46b658528a",
			"boardId": "08a0c2df-b58c-44bf-a84b-5bd3930a1999",
			"name": "a",
			"archived": false,
			"order": 6,
			"cards": []
		},
		{
			"id": "858f1706-06eb-49df-b31a-dd95901a1b9b",
			"boardId": "08a0c2df-b58c-44bf-a84b-5bd3930a1999",
			"name": "a",
			"archived": false,
			"order": 7,
			"cards": []
		}
	])

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

	// TODO switch this to be searching by list ID, not index
	// TODO make this generic so that it can work across any element. Maybe look into some sort of generic wrapper that can handle dnd
	// TODO look into splitting up a droppable (take thing drop in slot) and a swappable (d&d for each, can swap places around (useful for lists/cards))
	const swapLists = (indexA: number, indexB: number) => {
		// const lists = sockCtx.boardData?.lists;
		const lists = testLists;
		if(!lists) return;
		const t = lists[indexA];
		lists[indexA] = lists[indexB];
		lists[indexB] = t;
		console.log('swapped ', lists[indexA], lists[indexB]);
		setTestLists([...lists]);
	}
	console.log(testLists)
	return (
		<>
			<Container 
				h="100%" 
				fluid 
				maw="100%" 
				p="lg" 
				bg="#1d2022"
				style={{
					overflowX: "scroll"
				}}
			>
				<CollaborativeMouseTracker 
					boardId={params.boardId}
					style={{
						height: "95%",
						width: "fit-content",
						display: "flex",
						gap: "20px",
						alignItems: "flex-start",
						justifyContent: "flex-start",
						flexWrap: "nowrap",
					}}
				>
					{/* {
						<Droppable
							style={{
								width:"2px",
								height:"100%",
								backgroundColor:"blue",
							}}
						/>
					} */}
					{
						// sockCtx.boardData?.lists?.map((list: List, index: number) => {
						testLists?.map((list: List, index: number) => {
							return (
								<React.Fragment key={index}>
									<Droppable 
										id={index} 
										group={"lists"}
										onDragHover={(id, gr)=>{
											swapLists(id, index);
										}}
									>
									<Draggable id={index} group={"lists"}>
										<ListElement
											listType={list}
										/>
									</Draggable>
									</Droppable>
									{/* {
										<Droppable
											style={{
												width:"2px",
												height:"100%",
												backgroundColor:"blue",
											}}
										/>
									} */}
								</React.Fragment>
							)
						})
					}
					<CreateList/>
				</CollaborativeMouseTracker>
			</Container>
		</>
	);
};

export default BoardElement;
