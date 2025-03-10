import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Container} from "@mantine/core";
import CollaborativeMouseTracker from "@trz/wrappers/CollaborativeMouseTracker";
import {useNavigate, useParams} from "react-router-dom";
import {useSocket} from "@trz/contexts/socket-context";
import CreateList from "@trz/components/CreateList";
import {Board, BoardHeader, BoardId, Card, CardHeader, CardId, List, ListId, UID} from "@mosaiq/terrazzo-common/types";
import {NoteType, notify} from "@trz/util/notifications";
import SortableList from "@trz/components/DragAndDrop/SortableList";
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
import { RoomType, ServerSE } from "@mosaiq/terrazzo-common/socketTypes";
import { createList, emitMoveCard, emitMoveList, getBoardData } from "@trz/emitters/all";
import { useSocketListener } from "@trz/hooks/useSocketListener";
import { arrayMove, arrayMoveInPlace, updateBaseFromPartial } from "@mosaiq/terrazzo-common/utils/arrayUtils";
import { useRoom } from "@trz/hooks/useRoom";
import { useMap } from "@trz/hooks/useMap";

const BoardPage = (): React.JSX.Element => {
	const [boardData, setBoardData] = useState<BoardHeader | undefined>();
	const [draggingObject, setDraggingObject] = useState<{list?: ListId, card?: CardId}>({});
	const [activeObject, setActiveObject] = useState<ListId | CardId | null>(null);
	const [openedCard, setOpenedCard] = useState<CardId | undefined>();
	const lastOverId = useRef<string | null>(null);
	const params = useParams();
	const boardId = params.boardId as BoardId;
	const sockCtx = useSocket();
	const trz = useTRZ();
	const navigate = useNavigate();
	const [roomUsers, setRoomUsers] = useRoom(RoomType.DATA, boardId);
	const [listToCardsMap, setListMap] = useMap<ListId, CardId[]>();
	const [cardToListMap, setCardMap] = useMap<CardId, ListId>();

	const listEntries = Array.from(listToCardsMap.entries());
	const listKeys = Array.from(listToCardsMap.keys());

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
		const fetchBoardData = async () => {
			await new Promise((resolve)=>setTimeout(resolve, 0));
			if(strictIgnore || !boardId || !sockCtx.connected){
				return;
			}
			try{
				const boardRes = await getBoardData(sockCtx, boardId);
				setBoardData(boardRes);
				if(boardRes){
					const tempListMap = new Map<ListId, CardId[]>();
					const tempCardMap = new Map<CardId, ListId>();
					for (const list of boardRes.lists){
						const cardIds:CardId[] = [];
						for (const card of list.cardIds) {
							tempCardMap.set(card, list.listId);
							cardIds.push(card);
						}
						tempListMap.set(list.listId, cardIds);
					}
					setListMap(tempListMap);
					setCardMap(tempCardMap);
				}
			} catch(err) {
				notify(NoteType.BOARD_DATA_ERROR, err);
				navigate("/dashboard");
				return;
			}
		};
		fetchBoardData();
		return ()=>{
			strictIgnore = true;
		}
	}, [boardId, sockCtx.connected]);

	useSocketListener<ServerSE.UPDATE_BOARD_FIELD>(ServerSE.UPDATE_BOARD_FIELD, (payload)=>{
		setBoardData(prev => {
			if(!prev) {return prev;}
			return updateBaseFromPartial<BoardHeader>(prev, payload);
		});
	});

	useSocketListener<ServerSE.ADD_LIST>(ServerSE.ADD_LIST, (payload)=>{
		if(payload.boardId !== boardId){
			return;
		}
		listToCardsMap.set(payload.id, []);
	});

	useSocketListener<ServerSE.ADD_CARD>(ServerSE.ADD_CARD, (payload)=>{
		if(!listToCardsMap.has(payload.listId)){
			console.warn("Tried to add a card to an non-existent list");
			return;
		}
		cardToListMap.set(payload.id, payload.listId);
		const list = listToCardsMap.get(payload.listId);
		if(list){
			list.push(payload.id);
			listToCardsMap.set(payload.listId, list);
		}
	});

	useSocketListener<ServerSE.MOVE_LIST>(ServerSE.MOVE_LIST, (payload)=>{
		moveListToPos(payload.listId, payload.position)
		setRoomUsers((prev)=>{
			return prev.map((ru)=>{
				if(ru.mouseRoomData?.draggingList === payload.listId){
					return {
						...ru,
						mouseRoomData: {
							...ru.mouseRoomData,
							draggingList: undefined,
						}
					}
				}else{
					return ru;
				}
			})
		})
	});

	useSocketListener<ServerSE.MOVE_CARD>(ServerSE.MOVE_CARD, (payload)=>{
		moveCardToListAndPos(payload.cardId, payload.toList, payload.position);
		setRoomUsers((prev)=>{
			return prev.map((ru)=>{
				if(ru.mouseRoomData?.draggingCard === payload.cardId){
					return {
						...ru,
						mouseRoomData: {
							...ru.mouseRoomData,
							draggingList: undefined,
						}
					}
				}else{
					return ru;
				}
			})
		})
	});

	const sortableLists: React.JSX.Element[] = useMemo(()=>{ return listKeys.map((listId) => {
		console.log("Memo render", listKeys.join())
		return (
			<SortableList
				key={listId}
				listId={listId}
				boardCode={boardData?.boardCode ?? ""}
				onClickCard={openModal}
			/>
		);
	})}, [listKeys.join(), boardData?.boardCode])

	const isSortingList = !!(activeObject && listToCardsMap.has(activeObject))

	const openModal = useCallback((card: CardId) => {
		setOpenedCard(card);
	}, []);

	const closeModal = () => {
		setOpenedCard(undefined);
	}

	const moveListToPos = (listId: ListId, position: number) => {
		const list = listToCardsMap.get(listId);
		if(!list){
			console.error("List not found", listId);
			return;
		}

		const entries = listEntries;
		const index = entries.findIndex((l)=>l[0] === listId);
		if(index < 0) {
			console.error("Error moving list, list not found in prev lists");
			return;
		}
		arrayMoveInPlace(entries, index, position);
		setListMap(entries);
	}

	const moveCardToListAndPos = (cardId: CardId, toList: ListId, position?: number) => {
		const currentListId = cardToListMap.get(cardId);
		if(!currentListId){
			throw new Error("Card not in any list");
		}
		const currentListCards = listToCardsMap.get(currentListId);
		if(!currentListCards){
			throw new Error("Current list not found");
		}
		const currentListCardsRemoved = currentListCards.filter(c=>c!==cardId);
		const newListCards = listToCardsMap.get(toList);
		if(!newListCards){
			throw new Error("New list not found");
		}
		newListCards.push(cardId);

		listToCardsMap.set(toList, newListCards);
		listToCardsMap.set(currentListId, currentListCardsRemoved);
		cardToListMap.set(cardId, toList);
	};
	
	// setBoardData((prevBoard)=>{
	// 	if(!prevBoard)return prevBoard;
	// 	let currentListIndex: number = -1;
	// 	let currentCardIndexInCurrentList = -1;
	// 	let card: CardHeader | null = null;
	// 	let newListIndex: number = -1;
	// 	prevBoard.lists.forEach((l, li)=>{
	// 		if(l.id === toList)
	// 			newListIndex = li;
	// 		l.cards.forEach((c, ci)=>{
	// 			if(c.id === cardId){
	// 				card = c;
	// 				currentListIndex = li;
	// 				currentCardIndexInCurrentList = ci;
	// 			}
	// 		})
	// 	})
	// 	if(currentListIndex === newListIndex){
	// 		return prevBoard;
	// 	}
	// 	if(currentListIndex < 0 || newListIndex < 0 || currentCardIndexInCurrentList < 0 || card === null){
	// 		console.error("Error moving card to list, list or card not found");
	// 		return prevBoard;
	// 	}
	// 	prevBoard.lists[currentListIndex].cards.splice(currentCardIndexInCurrentList, 1);
	// 	prevBoard.lists[newListIndex].cards.splice(position ?? prevBoard.lists[newListIndex].cards.length, 0, card);
	// 	return {...prevBoard};
	// });

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
		if(listToCardsMap.has(activeId)) {
			// is dragging list
			setActiveObject(activeId);
			setDraggingObject({list: activeId});
		} else {
			// is dragging card
			setActiveObject(activeId);
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
		if(listToCardsMap.has(activeId)){
			// is dragging list
			console.log("list")
			return;
		}
		if(!overId){
			console.log("no over")
			return;
		}
		// is dragging card
		if(listToCardsMap.has(overId)) {
			console.log("over list")
			// is over a list - put that card into the list
			const cards = listToCardsMap.get(overId);
			const currentListId = cardToListMap.get(activeId);
			if(overId !== currentListId) {
				moveCardToListAndPos(activeId, overId);
			}
			return;
		}

		// is over a card - get the list and put it in
		console.log("over card")
		const newListId = cardToListMap.get(overId);
		if(!newListId){
			console.error("No listid found", overId);
			return;
		}
		const newListCards = listToCardsMap.get(newListId);
		if(!newListCards){
			console.error("No list found", overId);
			return;
		}
		const injectPos = newListCards.findIndex(c=>c === overId);
		const newIndex = injectPos >= 0 ? injectPos : newListCards.length + 1;
		moveCardToListAndPos(activeId, newListId, newIndex);
	}

	function handleDragEnd(event: DragEndEvent) {
		const {active, over} = event;
		const activeId = active.id.toString() as UID;
		const overId = over?.id.toString() as UID;
		setDraggingObject({});
		setActiveObject(null);
		if (listToCardsMap.size === 0 || !over) {
			return;
		}
		// is dropping list
		if(listToCardsMap.has(activeId)){
			const newIndex = listEntries.findIndex((v)=>v[0] === overId);
			if(newIndex > -1){
				moveList(activeId, newIndex);
			}
			return;
		}
		// is dropping card over a list
		if(listToCardsMap.has(overId)) {
			const list = listToCardsMap.get(overId);
			const cardsListId = cardToListMap.get(activeId);
			if(overId !== cardsListId) {
				moveCard(activeId, overId);
			}
			return;
		}
		// is dropping a card over another card
		const newListId = cardToListMap.get(overId);
		if(!newListId){
			console.error("No listId found", overId);
			return;
		}
		const newList = listToCardsMap.get(newListId);
		if(!newList){
			console.error("No list found", overId);
			return;
		}
		const injectPos = newList.findIndex(c=>c === overId);
		const newIndex = injectPos >= 0 ? injectPos : newList.length + 1;
		moveCard(activeId, newListId, newIndex);
	}

	function handleDragAbort(event: DragAbortEvent) {
		setActiveObject(null);
		setActiveObject(null);
		setDraggingObject({});
	}

	function handleDragCancel(event: DragCancelEvent) {
		setActiveObject(null);
		setDraggingObject({});
	}

	const collisionDetectionStrategy: CollisionDetection = (args) => {
		// Get the closest list horizontally
		const onlyListArgs = {...args, droppableContainers: args.droppableContainers.filter((container) => listToCardsMap.has(container.id.toString() as UID))};
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
			const list = listToCardsMap.get(intersectingId);
			if (list) {
				// If the list is empty, just intersect with the list
				// If the list has cards, find the closest card to intersect with
				if (list.length > 0) {
					const onlyCardsInThisListArgs = {...args,
						droppableContainers: args.droppableContainers.filter((droppable) =>
							droppable.id !== intersectingId // dont intersect with the actual list 
							&& !!list.find(c=>c === droppable.id) // only intersect with cards in this list
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
						items={listKeys}
						strategy={horizontalListSortingStrategy}
					>
						{sortableLists}
					</SortableContext>
					{createPortal(
						<DragOverlay dropAnimation={boardDropAnimation}>
						{activeObject
							? listToCardsMap.has(activeObject)
							? renderContainerDragOverlay(activeObject, boardData.boardCode ?? "#")
							: renderSortableItemDragOverlay(activeObject, boardData.boardCode ?? "#")
							: null}
						</DragOverlay>,
						document.body
					)}
				</DndContext>
				<CreateList
					onCreateList={async (title)=>{
						try {
							await createList(sockCtx, boardData.id, title)
						} catch (e) {
							notify(NoteType.LIST_CREATION_ERROR, e);
							return;
						} 
					}}
				/>
				{
					openedCard &&
					<CardDetails 
						cardId={openedCard}
						onClose={closeModal}
						boardCode={boardData.boardCode}
					/>
				}	
			</CollaborativeMouseTracker>
		</Container>
	);
};

export default BoardPage;