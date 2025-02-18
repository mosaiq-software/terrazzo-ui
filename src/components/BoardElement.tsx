import React, {useCallback, useEffect, useState} from "react";
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
	Active,
	Collision,
	rectIntersection,
	getFirstCollision,
	pointerWithin,
	MeasuringStrategy,
} from '@dnd-kit/core';
import {
	arrayMove,
	horizontalListSortingStrategy,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
	restrictToHorizontalAxis,
	restrictToParentElement,
	snapCenterToCursor,
} from '@dnd-kit/modifiers';
import { DroppableContainer, RectMap } from "@dnd-kit/core/dist/store";
import { Coordinates } from "@dnd-kit/core/dist/types";
import SortableCard from "./DragAndDrop/SortableCard";


const BoardElement = (): React.JSX.Element => {
	const params = useParams();
	const sockCtx = useSocket();
	const navigate = useNavigate();

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				delay: 0,
				tolerance: 0
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

	if (!params.boardId) {
		return <div>Board not found</div>;
	}

	function handleDragListStart(event: DragStartEvent) {
		const {active} = event;
		if(active.id){
			sockCtx.setDraggingObject({list: active.id.toString()});
		}
	}

	function handleDragListEnd(event: DragEndEvent) {
		const {active, over} = event;
		sockCtx.setDraggingObject({});
		if (sockCtx.boardData?.lists && over && active.id !== over.id) {
			const newIndex = sockCtx.boardData.lists.findIndex((v)=>v.id === over.id);
			if(newIndex > -1){
				sockCtx.moveList(active.id.toString(), newIndex);
			}
		}
	}

	// const collisionDetectionStrategy: CollisionDetection = useCallback( (args) => {
	// 	if (activeId && activeId in items) {
	// 		return closestCenter({
	// 			...args,
	// 			droppableContainers: args.droppableContainers.filter(
	// 			(container) => container.id in items
	// 			),
	// 		});
	// 	}

	// 	// Start by finding any intersecting droppable
	// 	const pointerIntersections = pointerWithin(args);
	// 	const intersections =
	// 	pointerIntersections.length > 0
	// 		? // If there are droppables intersecting with the pointer, return those
	// 		pointerIntersections
	// 		: rectIntersection(args);
	// 	let overId = getFirstCollision(intersections, 'id');

	// 		if (overId != null) {

	// 		if (overId in items) {
	// 			const containerItems = items[overId];

	// 			// If a container is matched and it contains items (columns 'A', 'B', 'C')
	// 			if (containerItems.length > 0) {
	// 			// Return the closest droppable within that container
	// 			overId = closestCenter({
	// 				...args,
	// 				droppableContainers: args.droppableContainers.filter(
	// 				(container) =>
	// 					container.id !== overId &&
	// 					containerItems.includes(container.id)
	// 				),
	// 			})[0]?.id;
	// 			}
	// 		}

	// 		lastOverId.current = overId;

	// 		return [{ id: overId }];
	// 	}

	// 	// When a draggable item moves to a new container, the layout may shift
	// 	// and the `overId` may become `null`. We manually set the cached `lastOverId`
	// 	// to the id of the draggable item that was moved to the new container, otherwise
	// 	// the previous `overId` will be returned which can cause items to incorrectly shift positions
	// 	if (recentlyMovedToNewContainer.current) {
	// 		lastOverId.current = activeId;
	// 	}

	// 	// If no droppable is matched, return the last match
	// 	return lastOverId.current ? [{ id: lastOverId.current }] : [];
	// }, [activeId, items] );

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
					collisionDetection={closestCenter}
					modifiers={[snapCenterToCursor, restrictToHorizontalAxis, restrictToParentElement]}
					onDragEnd={handleDragListEnd}
					onDragStart={handleDragListStart}
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
									key={listIndex}
									listType={list}
								>
									<SortableContext 
										items={list.cards}
										strategy={verticalListSortingStrategy}
									>{
										list.cards.map((card: Card, cardIndex: number) => {
											return (
												<SortableCard
													key={cardIndex}
													cardType={card}
												/>
											);
										})
									}</SortableContext>
								</SortableList>
							);
						})
					}</SortableContext>
				</DndContext>
				<CreateList/>
			</CollaborativeMouseTracker>
		</Container>
	);
};


export default BoardElement;
