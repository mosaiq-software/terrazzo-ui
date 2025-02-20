import React, {useEffect, useMemo, useRef, useState} from "react";
import {Container} from "@mantine/core";
import CollaborativeMouseTracker from "@trz/wrappers/collaborativeMouseTracker";
import {useNavigate, useParams} from "react-router-dom";
import {useSocket} from "@trz/util/socket-context";
import CreateList from "@trz/components/CreateList";
import {Card, List} from "@mosaiq/terrazzo-common/types";
import {NoteType, notify} from "@trz/util/notifications";
import SortableList from "@trz/components/DragAndDrop/SortableList"
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
	pointerWithin,
	MeasuringStrategy,
	DragOverlay,
	closestCorners,
	defaultDropAnimationSideEffects,
	DropAnimation,
} from '@dnd-kit/core';
import {
	horizontalListSortingStrategy,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { DragAbortEvent, DragCancelEvent, DragOverEvent } from "@dnd-kit/core/dist/types";
import SortableCard from "./DragAndDrop/SortableCard";
import { createPortal } from "react-dom";
import ListElement from "./ListElement";
import CardElement from "./CardElement";

const dropAnimation: DropAnimation = {
	sideEffects: defaultDropAnimationSideEffects({
		styles: {
			active: {
				opacity: '0.5',
			},
		},
	}),
};

const BoardElement = (): React.JSX.Element => {
	const [activeObject, setActiveObject] = useState<List | Card | null>(null);
	const lastOverId = useRef<string | null>(null);
	const params = useParams();
	const sockCtx = useSocket();
	const navigate = useNavigate();

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 2,
			}
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

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

	const allListIds = useMemo(()=>{
		return sockCtx.boardData?.lists.map(l=>l.id) ?? [];
	}, [sockCtx.boardData?.lists])

	const getCard = (cardId: string): Card | null => {
		if(!sockCtx.boardData){
			return null;
		}
		let card: Card | null = null;
		sockCtx.boardData.lists.forEach(l=>{
			l.cards.forEach(c=>{
				if(c.id === cardId)
					card = c;
			})
		})
		return card;
	}

	const isSortingList = !!(activeObject && allListIds.includes(activeObject.id.toString()))

	const getList = (listId: string): List | null => {
		return sockCtx.boardData?.lists.find(l=>l.id === listId) ?? null;
	}

	const getCardsList = (cardId: string): List | null => {
		if(!sockCtx.boardData){
			return null;
		}
		let list: List | null = null;
		sockCtx.boardData.lists.forEach(l=>{
			l.cards.forEach(c=>{
				if(c.id === cardId)
					list = l;
			})
		})
		return list;
	}

	function handleDragStart(event: DragStartEvent) {
		const activeId = event.active.id.toString();
		if(allListIds.includes(activeId)) {
			// is dragging list
			setActiveObject(getList(activeId));
			sockCtx.setDraggingObject({list: activeId});
		} else {
			// is dragging card
			 setActiveObject(getCard(activeId));
			sockCtx.setDraggingObject({card: activeId});
		}
	}

	function handleDragOver(event: DragOverEvent) {
		const {active, over} = event;
		const activeId = active.id.toString();
		const overId = over?.id.toString();
		if(activeId === overId){
			return;
		}
		if(allListIds.includes(activeId)){
			// is dragging list
		} else if(overId){
			// is dragging card
			if(allListIds.includes(overId)) {
				// is over a list
				const list = getList(overId);
				const cardsList = getCardsList(activeId);
				if(list?.id !== cardsList?.id) {
					sockCtx.moveCardToListAndPos(activeId, overId);
				}
			} else {
				// is over a card
				const newList = getCardsList(overId);
				if(!newList){
					console.error("No list found", overId);
					return;
				}
				const injectPos = newList.cards.findIndex(c=>c.id === overId);
				const newIndex = injectPos >= 0 ? injectPos : newList.cards.length + 1;
				sockCtx.moveCardToListAndPos(activeId, newList.id, newIndex);
			}
		}
	}

	function handleDragEnd(event: DragEndEvent) {
		const {active, over} = event;
		const activeId = active.id.toString();
		const overId = over?.id.toString() ?? "NULL OBJECT";
		sockCtx.setDraggingObject({});
		setActiveObject(null);
		if (sockCtx.boardData?.lists && over && activeId !== overId) {
			if(allListIds.includes(activeId)){
				// is dropping list
				const newIndex = sockCtx.boardData.lists.findIndex((v)=>v.id === overId);
				if(newIndex > -1){
					sockCtx.moveList(activeId, newIndex);
				}
			} else {
				// is dropping card
				if(allListIds.includes(overId)) {
					// is over a list
					const list = getList(overId);
					const cardsList = getCardsList(activeId);
					if(list?.id !== cardsList?.id) {
						sockCtx.moveCard(activeId, overId);
					}
				} else {
					// is over a card
					const newList = getCardsList(overId);
					if(!newList){
						console.error("No list found", overId);
						return;
					}
					const injectPos = newList.cards.findIndex(c=>c.id === overId);
					const newIndex = injectPos >= 0 ? injectPos : newList.cards.length + 1;
					sockCtx.moveCard(activeId, newList.id, newIndex);
				}
			}
			
		}
	}

	function handleDragAbort(event: DragAbortEvent) {
		setActiveObject(null);
		setActiveObject(null);
		sockCtx.setDraggingObject({});
	}

	function handleDragCancel(event: DragCancelEvent) {
		const {active, over} = event;
		setActiveObject(null);
		sockCtx.setDraggingObject({});
	}

	const collisionDetectionStrategy: CollisionDetection = (args) => {
		const onlyListArgs = {...args, droppableContainers: args.droppableContainers.filter((container) => allListIds.includes(container.id.toString()))};

		const closestLists = closestCorners(onlyListArgs);
		console.log(closestLists.map(l=>l.id.toString().substring(0,2)).join(" "));

		if(args.active.data.current?.type === "list"){
			return closestLists;
		} else if(args.active.data.current?.type === "card"){
			// Get the horizontally closest list
			const ptrCrds = args.pointerCoordinates;
			let intersectingId: string | null = null;
			let minDelta = 10000000;
			onlyListArgs.droppableContainers.forEach((l)=>{
				if(ptrCrds && l.rect.current){
					const center = l.rect.current.left + (l.rect.current.width / 2.0);
					const delta = Math.abs(center - ptrCrds.x);
					if(delta < minDelta){
						intersectingId = l.id.toString();
						minDelta = delta;
					}
				}
			});

			if(!intersectingId) {
				return lastOverId.current ? [{ id: lastOverId.current }] : [];
			}

			const list = getList(intersectingId);
			if (list) {
				if (list.cards.length > 0) {
					const onlyContainerArgs = {...args,
						droppableContainers: args.droppableContainers.filter((droppable) =>
							droppable.id !== list.id && !!list.cards.find(l=>l.id === droppable.id)
					)};
					// intersectingId = onlyContainerArgs.droppableContainers[0].id.toString();
					intersectingId = closestCenter(onlyContainerArgs)[0]?.id.toString();
				}
				lastOverId.current = intersectingId;
				return [{ id: intersectingId }];
			}
			return lastOverId.current ? [{ id: lastOverId.current }] : [];
		}
		return [];
	};

	if (!params.boardId || ! sockCtx.boardData) {
		return <div>Board not found</div>;
	}

	return (
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
						items={sockCtx.boardData?.lists ?? []}
						strategy={horizontalListSortingStrategy}
					>{
						sockCtx.boardData?.lists?.map((list: List, listIndex: number) => {
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
										list.cards.map((card: Card, cardIndex: number) => {
											return (
												<SortableCard
													key={card.id + "i"+cardIndex}
													cardType={card}
													disabled={isSortingList}
												/>
											);
										})
									}</SortableContext>
								</SortableList>
							);
						})
					}</SortableContext>
					{createPortal(
						<DragOverlay dropAnimation={dropAnimation}>
						{activeObject
							? allListIds.includes(activeObject.id.toString())
							? renderContainerDragOverlay(activeObject as List)
							: renderSortableItemDragOverlay(activeObject as Card)
							: null}
						</DragOverlay>,
						document.body
					)}
				</DndContext>
				<CreateList/>
			</CollaborativeMouseTracker>
		</Container>
	);
};

function renderContainerDragOverlay(list: List) {
	return (
		<ListElement
			listType={list}
			dragging
			isOverlay={true}
		>
			{
				list.cards.map((card: Card, cardIndex: number) => {
					return (
						<CardElement
							key={cardIndex}
							cardType={card}
							dragging={false}
							isOverlay={false}
						/>
					);
				})
			}
		</ListElement>
	);
}

function renderSortableItemDragOverlay(card: Card) {
	return (
		<CardElement
			cardType={card}
			dragging={true}
			isOverlay={true}
		/>
	);
}

export default BoardElement;