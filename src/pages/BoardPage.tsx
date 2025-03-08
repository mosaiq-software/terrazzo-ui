import React, {useEffect, useMemo, useRef, useState} from "react";
import {Container} from "@mantine/core";
import CollaborativeMouseTracker from "@trz/wrappers/CollaborativeMouseTracker";
import {useNavigate, useParams} from "react-router-dom";
import {useSocket} from "@trz/util/socket-context";
import CreateList from "@trz/components/CreateList";
import {BoardId, Card, CardHeader, List, ListId, UID} from "@mosaiq/terrazzo-common/types";
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
import { NotFound } from "@trz/components/NotFound";
import {ListType} from "../../../terrazzo-common/dist/constants";

const BoardPage = (): React.JSX.Element => {
	const [activeObject, setActiveObject] = useState<List | Card | null>(null);
	const lastOverId = useRef<string | null>(null);
	const params = useParams();
	const sockCtx = useSocket();
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
		const fetchBoardData = async () => {
			if (!params.boardId) {
				return;
			}
			await sockCtx.getBoardData(params.boardId as BoardId)
				.catch((err) => {
					notify(NoteType.BOARD_DATA_ERROR, err);
					navigate("/dashboard");
					return
				});
		};
		fetchBoardData();
	}, [params.boardId, sockCtx.connected]);

	const allListIds = useMemo(()=>{
		return sockCtx.boardData?.lists.map(l=>l.id) ?? [];
	}, [sockCtx.boardData?.lists])

	const isSortingList = !!(activeObject && allListIds.includes(activeObject.id.toString() as ListId))

	function handleDragStart(event: DragStartEvent) {
		const activeId = event.active.id.toString() as UID;
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
		const activeId = active.id.toString() as UID;
		const overId = over?.id.toString() as UID;
		if(activeId === overId){
			return;
		}
		if(allListIds.includes(activeId)){
			// is dragging list
			return;
		}
		if(overId){
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
		const activeId = active.id.toString() as UID;
		const overId = over?.id.toString() as UID;
		sockCtx.setDraggingObject({});
		setActiveObject(null);
		if (!sockCtx.boardData?.lists || !over) {
			return;
		}
		// is dropping list
		if(allListIds.includes(activeId)){
			const newIndex = sockCtx.boardData.lists.findIndex((v)=>v.id === overId);
			if(newIndex > -1){
				sockCtx.moveList(activeId, newIndex);
			}
			return;
		}
		// is dropping card over a list
		if(allListIds.includes(overId)) {
			const list = getList(overId, sockCtx.boardData?.lists);
			const cardsList = getCardsList(activeId, sockCtx.boardData?.lists);
			if(list?.id !== cardsList?.id) {
				if(list?.type === ListType.NORMAL){
					sockCtx.moveCard(activeId, overId, overId);
				}else{
					sockCtx.moveCard(activeId, overId, undefined);
				}
			}
			return;
		}
		// is dropping a card over another card
		const newList = getCardsList(overId, sockCtx.boardData?.lists);
		if(!newList){
			console.error("No list found", overId);
			return;
		}
		const injectPos = newList.cards.findIndex(c=>c.id === overId);
		const newIndex = injectPos >= 0 ? injectPos : newList.cards.length + 1;
		if(newList.type === ListType.NORMAL){
			sockCtx.moveCard(activeId, newList.id, newList.id, newIndex);
		}else{
			sockCtx.moveCard(activeId, newList.id, undefined, newIndex);
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
		const onlyListArgs = {...args, droppableContainers: args.droppableContainers.filter((container) => allListIds.includes(container.id.toString() as UID))};
		let intersectingId = horizontalCollisionDetection(onlyListArgs) as UID;
		if(args.active.data.current?.type === "list"){
			if(!intersectingId) {
				return lastOverId.current ? [{ id: lastOverId.current }] : [];
			}
			return [{ id: intersectingId }];
		}
		if(args.active.data.current?.type === "card"){
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
					intersectingId = closestCenter(onlyContainerArgs)[0]?.id.toString() as UID;
				}
				lastOverId.current = intersectingId;
				return [{ id: intersectingId }];
			}
			return lastOverId.current ? [{ id: lastOverId.current }] : [];
		}
		return [];
	};

	if (!params.boardId || ! sockCtx.boardData) {
		return <NotFound itemType="Board"/>
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
				boardId={params.boardId as BoardId}
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
						sockCtx.boardData?.lists
							?.filter((list: List) => !list.archived)
							.map((list: List, listIndex: number) => {
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
											.filter((card: CardHeader) => !card.archived)
											.map((card: CardHeader, cardIndex: number) => {
											return (
												<SortableCard
													key={card.id + "i"+cardIndex}
													cardHeader={card}
													disabled={isSortingList}
													boardCode={sockCtx.boardData?.boardCode ?? "#"}
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
							? renderContainerDragOverlay(activeObject as List, sockCtx.boardData?.boardCode ?? "#")
							: renderSortableItemDragOverlay(activeObject as Card, sockCtx.boardData?.boardCode ?? "#")
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

export default BoardPage;