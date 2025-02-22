import React, {useEffect, useMemo, useRef, useState} from "react";
import {Container} from "@mantine/core";
import CollaborativeMouseTracker from "@trz/wrappers/CollaborativeMouseTracker";
import {useNavigate, useParams} from "react-router-dom";
import {useSocket} from "@trz/util/socket-context";
import CreateList from "@trz/components/CreateList";
import {Card, List} from "@mosaiq/terrazzo-common/types";
import {NoteType, notify} from "@trz/util/notifications";
import SortableList from "@trz/components/DragAndDrop/SortableList"
import {getCard, getCardsList, getList} from "@trz/util/boardUtils"
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
import SortableCard from "./DragAndDrop/SortableCard";
import { createPortal } from "react-dom";
import {boardDropAnimation, horizontalCollisionDetection, renderContainerDragOverlay, renderSortableItemDragOverlay} from "@trz/util/dragAndDropUtils";
import CardDetails from "@trz/components/CardDetails";

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

	const isSortingList = !!(activeObject && allListIds.includes(activeObject.id.toString()))

	function handleDragStart(event: DragStartEvent) {
		const activeId = event.active.id.toString();
		if(allListIds.includes(activeId)) {
			// is dragging list
			setActiveObject(getList(activeId, sockCtx.boardData?.lists));
			sockCtx.setDraggingObject({list: activeId});
		} else {
			// is dragging card
			 setActiveObject(getCard(activeId, sockCtx.boardData?.lists));
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
				const list = getList(overId, sockCtx.boardData?.lists);
				const cardsList = getCardsList(activeId, sockCtx.boardData?.lists);
				if(list?.id !== cardsList?.id) {
					sockCtx.moveCardToListAndPos(activeId, overId);
				}
			} else {
				// is over a card
				const newList = getCardsList(overId, sockCtx.boardData?.lists);
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
					const list = getList(overId, sockCtx.boardData?.lists);
					const cardsList = getCardsList(activeId, sockCtx.boardData?.lists);
					if(list?.id !== cardsList?.id) {
						sockCtx.moveCard(activeId, overId);
					}
				} else {
					// is over a card
					const newList = getCardsList(overId, sockCtx.boardData?.lists);
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
		let intersectingId = horizontalCollisionDetection(onlyListArgs);
		if(args.active.data.current?.type === "list"){
			if(!intersectingId) {
				return lastOverId.current ? [{ id: lastOverId.current }] : [];
			}
			return [{ id: intersectingId }];
		} else if(args.active.data.current?.type === "card"){
			if(!intersectingId) {
				return lastOverId.current ? [{ id: lastOverId.current }] : [];
			}

			const list = getList(intersectingId, sockCtx.boardData?.lists);
			if (list) {
				if (list.cards.length > 0) {
					const onlyContainerArgs = {...args,
						droppableContainers: args.droppableContainers.filter((droppable) =>
							droppable.id !== list.id && !!list.cards.find(l=>l.id === droppable.id)
					)};
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
						<DragOverlay dropAnimation={boardDropAnimation}>
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
				<CardDetails/>
			</CollaborativeMouseTracker>
		</Container>
	);
};

export default BoardElement;