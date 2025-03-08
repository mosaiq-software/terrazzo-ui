import React, {useEffect, useMemo, useRef, useState} from "react";
import {Container} from "@mantine/core";
import CollaborativeMouseTracker from "@trz/wrappers/CollaborativeMouseTracker";
import {useNavigate, useParams} from "react-router-dom";
import {useSocket} from "@trz/contexts/socket-context";
import CreateList from "@trz/components/CreateList";
import {Board, BoardId, Card, CardHeader, CardId, List, ListId, UID} from "@mosaiq/terrazzo-common/types";
import {NoteType, notify} from "@trz/util/notifications";
import SortableList from "@trz/components/DragAndDrop/SortableList";
import {getCard, getCardsList, getList} from "@trz/util/boardUtils";
import {
	DndContext, 
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
	DragStartEvent,
	CollisionDetection,
	MeasuringStrategy,
	DragOverlay,
} from '@dnd-kit/core';
import {
	horizontalListSortingStrategy,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { DragAbortEvent, DragCancelEvent, DragOverEvent } from "@dnd-kit/core/dist/types";
import SortableCard from "@trz/components/DragAndDrop/SortableCard";
import { createPortal } from "react-dom";
import {boardDropAnimation, horizontalCollisionDetection, renderContainerDragOverlay, renderSortableItemDragOverlay} from "@trz/util/dragAndDropUtils";
import CardDetails from "@trz/components/CardDetails";
import { NotFound, PageErrors } from "@trz/components/NotFound";
import { useTRZ } from "@trz/contexts/TRZ-context";
import { getRoomCode } from "@mosaiq/terrazzo-common/utils/socketUtils";
import { RoomType, ServerSE } from "@mosaiq/terrazzo-common/socketTypes";
import { emitMoveCard, emitMoveList, getBoardData } from "@trz/emitters/all";
import { useSocketListener } from "@trz/hooks/useSocketListener";
import { arrayMove, updateBaseFromPartial } from "@mosaiq/terrazzo-common/utils/arrayUtils";

const BoardPage = (): React.JSX.Element => {
	const [boardData, setBoardData] = useState<Board | undefined>();
	const [draggingObject, setDraggingObject] = useState<{list?: ListId, card?: CardId}>({});
	const [activeObject, setActiveObject] = useState<List | Card | null>(null);
	const [openedCard, setOpenedCard] = useState<Card | undefined>();
	const lastOverId = useRef<string | null>(null);
	const params = useParams();
	const boardId = params.boardId as BoardId;
	const sockCtx = useSocket();
	const trz = useTRZ();
	const navigate = useNavigate();

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 6,
			}
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	useEffect(() => {
		let strictIgnore = false;
		const fetchOrgData = async () => {
			await new Promise((resolve)=>setTimeout(resolve, 0));
			if(strictIgnore || !boardId || !sockCtx.connected){
				return;
			}
			try{
				const board = await getBoardData(sockCtx, boardId);
				setBoardData(board);
			} catch(err) {
				notify(NoteType.BOARD_DATA_ERROR, err);
				navigate("/dashboard");
				return;
			}
		};
		fetchOrgData();
		return ()=>{
			strictIgnore = true;
		}
	}, [boardId, sockCtx.connected]);

	useSocketListener<ServerSE.UPDATE_BOARD_FIELD>(ServerSE.UPDATE_BOARD_FIELD, (payload)=>{
		setBoardData(prev => {
			if(!prev) {return prev;}
			return updateBaseFromPartial<Board>(prev, payload);
		});
	});

	const allListIds = useMemo(()=>{
		return boardData?.lists.map(l=>l.id) ?? [];
	}, [boardData?.lists])

	const isSortingList = !!(activeObject && allListIds.includes(activeObject.id))

	const openModal = (card: Card) => {
		setOpenedCard(card);
		// try {
		// 	sockCtx.initializeTextBlockData(card.descriptionTextBlockId);
		// 	sockCtx.setRoom(getRoomCode(RoomType.TEXT, card.descriptionTextBlockId));
		// } catch (e) {
		// 	notify(NoteType.SOCKET_ROOM_ERROR, [getRoomCode(RoomType.TEXT, card.descriptionTextBlockId)]);
		// }
	}

	const closeModal = () => {
		setOpenedCard(undefined);
		// try {
		// 	sockCtx.setRoom(getRoomCode(RoomType.MOUSE, boardId));
		// } catch (e) {
		// 	notify(NoteType.SOCKET_ROOM_ERROR, [getRoomCode(RoomType.MOUSE, boardId)]);
		// }
	}

	const moveListToPos = (listId: ListId, position: number) => setBoardData((prevBoard)=>{
		if(!prevBoard)return prevBoard;
		const index = prevBoard.lists.findIndex((l)=>l.id === listId);
		if(index < 0) {
			console.error("Error moving list, list not found in prev lists");
			return prevBoard;
		}
		return{
			...prevBoard,
			lists: arrayMove<List>(prevBoard.lists, index, position)
		}
	});

	const moveCardToListAndPos = (cardId: CardId, toList: ListId, position?: number) => setBoardData((prevBoard)=>{
		if(!prevBoard)return prevBoard;
		let currentListIndex: number = -1;
		let currentCardIndexInCurrentList = -1;
		let card: CardHeader | null = null;
		let newListIndex: number = -1;
		prevBoard.lists.forEach((l, li)=>{
			if(l.id === toList)
				newListIndex = li;
			l.cards.forEach((c, ci)=>{
				if(c.id === cardId){
					card = c;
					currentListIndex = li;
					currentCardIndexInCurrentList = ci;
				}
			})
		})
		if(currentListIndex === newListIndex){
			return prevBoard;
		}
		if(currentListIndex < 0 || newListIndex < 0 || currentCardIndexInCurrentList < 0 || card === null){
			console.error("Error moving card to list, list or card not found");
			return prevBoard;
		}
		prevBoard.lists[currentListIndex].cards.splice(currentCardIndexInCurrentList, 1);
		prevBoard.lists[newListIndex].cards.splice(position ?? prevBoard.lists[newListIndex].cards.length, 0, card);
		return {...prevBoard};
	});

	const moveList = async (listId: ListId, position: number): Promise<void> => {
		moveListToPos(listId, position);
		emitMoveList(sockCtx, listId, position);
	}

	const moveCard = async (cardId: CardId, toList: ListId, position?: number): Promise<void> => {
		moveCardToListAndPos(cardId, toList, position);
		emitMoveCard(sockCtx, cardId, toList, position);
	}

	function handleDragStart(event: DragStartEvent) {
		const activeId = event.active.id.toString() as UID;
		if(allListIds.includes(activeId)) {
			// is dragging list
			setActiveObject(getList(activeId, boardData?.lists));
			setDraggingObject({list: activeId});
		} else {
			// is dragging card
			 setActiveObject(getCard(activeId, boardData?.lists));
			setDraggingObject({card: activeId});
		}
	}

	function handleDragOver(event: DragOverEvent) {
		const {active, over} = event;
		const activeId = active.id.toString() as UID;
		const overId = over?.id.toString() as UID;
		if(activeId === overId){
			console.log("same")
			return;
		}
		if(allListIds.includes(activeId)){
			// is dragging list
			console.log("list")
			return;
		}
		if(!overId){
			console.log("no over")
			return;
		}
		// is dragging card
		if(allListIds.includes(overId)) {
			console.log("over list")
			// is over a list
			const list = getList(overId, boardData?.lists);
			const cardsList = getCardsList(activeId, boardData?.lists);
			if(list?.id !== cardsList?.id) {
				moveCardToListAndPos(activeId, overId);
			}
			return;
		}

		// is over a card
		console.log("over card")
		const newList = getCardsList(overId, boardData?.lists);
		if(!newList){
			console.error("No list found", overId);
			return;
		}
		const injectPos = newList.cards.findIndex(c=>c.id === overId);
		const newIndex = injectPos >= 0 ? injectPos : newList.cards.length + 1;
		moveCardToListAndPos(activeId, newList.id, newIndex);
	}

	function handleDragEnd(event: DragEndEvent) {
		const {active, over} = event;
		const activeId = active.id.toString() as UID;
		const overId = over?.id.toString() as UID;
		setDraggingObject({});
		setActiveObject(null);
		if (!boardData?.lists || !over) {
			return;
		}
		// is dropping list
		if(allListIds.includes(activeId)){
			const newIndex = boardData.lists.findIndex((v)=>v.id === overId);
			if(newIndex > -1){
				moveList(activeId, newIndex);
			}
			return;
		}
		// is dropping card over a list
		if(allListIds.includes(overId)) {
			const list = getList(overId, boardData?.lists);
			const cardsList = getCardsList(activeId, boardData?.lists);
			if(list?.id !== cardsList?.id) {
				moveCard(activeId, overId);
			}
			return;
		}
		// is dropping a card over another card
		const newList = getCardsList(overId, boardData?.lists);
		if(!newList){
			console.error("No list found", overId);
			return;
		}
		const injectPos = newList.cards.findIndex(c=>c.id === overId);
		const newIndex = injectPos >= 0 ? injectPos : newList.cards.length + 1;
		moveCard(activeId, newList.id, newIndex);
	}

	function handleDragAbort(event: DragAbortEvent) {
		setActiveObject(null);
		setActiveObject(null);
		setDraggingObject({});
	}

	function handleDragCancel(event: DragCancelEvent) {
		const {active, over} = event;
		setActiveObject(null);
		setDraggingObject({});
	}

	const collisionDetectionStrategy: CollisionDetection = (args) => {
		// Get the closest list horizontally
		const onlyListArgs = {...args, droppableContainers: args.droppableContainers.filter((container) => allListIds.includes(container.id.toString() as UID))};
		let intersectingId = horizontalCollisionDetection(onlyListArgs) as UID;
		
		// If theres no intersection, fall back to the last known intersected item
		if(!intersectingId) {
			//TODO check if this is causing the weird offset issues
			return lastOverId.current ? [{ id: lastOverId.current }] : [];
		}

		// If dragging a list, easy - collide with another list
		if(args.active.data.current?.type === "list"){
			return [{ id: intersectingId }];
		}
		
		// If dragging a card, find which list you're closest to
		if(args.active.data.current?.type === "card"){
			const list = getList(intersectingId, boardData?.lists);
			if (list) {
				// If the list is empty, just intersect with the list
				// If the list has cards, find the closest card to intersect with
				if (list.cards.length > 0) {
					const onlyCardsInThisListArgs = {...args,
						droppableContainers: args.droppableContainers.filter((droppable) =>
							droppable.id !== list.id // dont intersect with the actual list 
							&& !!list.cards.find(c=>c.id === droppable.id) // only intersect with cards in this list
					)};
					intersectingId = closestCenter(onlyCardsInThisListArgs)[0]?.id.toString() as UID;
				}
				lastOverId.current = intersectingId;
				return [{ id: intersectingId }];
			}
			return lastOverId.current ? [{ id: lastOverId.current }] : [];
		}
		return [];
	};

	if (!boardId || ! boardData) {
		return <NotFound itemType="Board" error={PageErrors.NOT_FOUND}/>
	}

	return (
		<Container 
			h={`calc(100vh - ${trz.navbarHeight}px)`} 
			fluid 
			maw="100%" 
			p="lg" 
			bg="#1d2022"
			style={{
				overflowX: "scroll"
			}}
		>
			<CollaborativeMouseTracker
				boardId={boardId}
				draggingObject={draggingObject}
				style={{
					height: "95%",
					width: "auto",
					display: "flex",
					gap: "20px",
					alignItems: "flex-start",
					justifyContent: "flex-start",
					flexWrap: "nowrap",
				}}
			>
				<DndContext
					sensors={sensors}
					collisionDetection={collisionDetectionStrategy}
					onDragEnd={handleDragEnd}
					onDragOver={handleDragOver}
					onDragStart={handleDragStart}
					onDragAbort={handleDragAbort}
					onDragCancel={handleDragCancel}
					measuring={{
						droppable: {
							strategy: MeasuringStrategy.Always,
						},
					}}
				>
					<SortableContext 
						items={boardData?.lists ?? []}
						strategy={horizontalListSortingStrategy}
					>{
						boardData.lists
							?.filter((list) => !list.archived)
							.map((list, listIndex) => {
							if(list.archived){
								return null;
							}
							return (
								<SortableList
									key={list.id + " : " + list.cards.map(c=>c.id).join(" ")}
									listType={list}
									index={listIndex}
								>
									<SortableContext 
										items={list.cards}
										strategy={verticalListSortingStrategy}
									>{
										list.cards
											.filter((card) => !card.archived)
											.map((card, cardIndex) => {
											return (
												<SortableCard
													key={card.id + "i"+cardIndex}
													card={card}
													disabled={isSortingList}
													boardCode={boardData.boardCode ?? "#"}
													onClick={()=>{
														openModal(card);
													}}
												/>
											);
										})
									}</SortableContext>
								</SortableList>
							);
						})
					}</SortableContext>
					{createPortal(
						<DragOverlay dropAnimation={boardDropAnimation}>
						{activeObject
							? allListIds.includes(activeObject.id.toString() as UID)
							? renderContainerDragOverlay(activeObject as List, boardData.boardCode ?? "#")
							: renderSortableItemDragOverlay(activeObject as Card, boardData.boardCode ?? "#")
							: null}
						</DragOverlay>,
						document.body
					)}
				</DndContext>
				<CreateList/>
				{
					openedCard &&
					<CardDetails 
						card={openedCard}
						onClose={closeModal}
					/>
				}	
			</CollaborativeMouseTracker>
		</Container>
	);
};

export default BoardPage;