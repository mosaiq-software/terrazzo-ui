import React, {useCallback, useEffect, useRef, useState} from "react";
import {Container} from "@mantine/core";
import CollaborativeMouseTracker from "@trz/wrappers/collaborativeMouseTracker";
import {useNavigate, useParams} from "react-router-dom";
import {useSocket} from "@trz/util/socket-context";
import CreateList from "@trz/components/CreateList";
import {Card, List} from "@mosaiq/terrazzo-common/types";
import {NoteType, notify} from "@trz/util/notifications";
import SortableList from "@trz/components/DragAndDrop/SortableList"
import { arrayMove } from "@mosaiq/terrazzo-common/utils/arrayUtils";
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
import {
	restrictToHorizontalAxis,
	restrictToParentElement,
	snapCenterToCursor,
} from '@dnd-kit/modifiers';
import { DroppableContainer, RectMap } from "@dnd-kit/core/dist/store";
import { Coordinates, DragAbortEvent, DragCancelEvent, DragOverEvent, UniqueIdentifier } from "@dnd-kit/core/dist/types";
import SortableCard from "./DragAndDrop/SortableCard";
import { createPortal } from "react-dom";
import ListElement from "./ListElement";
import CardElement from "./CardElement";


const BoardElement = (): React.JSX.Element => {
	const [testLists, setTestLists] = useState<List[]>([
		{
		  "id": "c21e516b-987d-4381-95f9-f5ab7ed9b6fd",
		  "boardId": "e2ead73c-6b8c-416a-9331-375f2bc3d484",
		  "name": "List A",
		  "archived": false,
		  "order": 0,
		  "cards": []
		},
		{
		  "id": "48afe3e4-736d-433c-885c-819b27568c64",
		  "boardId": "e2ead73c-6b8c-416a-9331-375f2bc3d484",
		  "name": "List B",
		  "archived": false,
		  "order": 1,
		  "cards": []
		}
	  ]);
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

	const [activeObject, setActiveObject] = useState<List | Card | null>(null);
	const recentlyMovedToNewContainer = useRef(false);
	const lastOverId = useRef<string | null>(null);


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

	const getListIds = useCallback(()=>{
		return testLists.map(l=>l.id) ?? [];
		// return sockCtx.boardData?.lists.map(l=>l.id) ?? [];
	}, [testLists])
	// }, [sockCtx.boardData?.lists])

	const getCard = (cardId: string): Card | null => {
		if(!sockCtx.boardData){
			return null;
		}
		let card: Card | null = null;
		// sockCtx.boardData.lists.forEach(l=>{
		testLists.forEach(l=>{
			l.cards.forEach(c=>{
				if(c.id === cardId)
					card = c;
			})
		})
		return card;
	}

	const isSortingList = !!(activeObject && getListIds().includes(activeObject.id.toString()))

	const getList = (listId: string): List | null => {
		// return sockCtx.boardData?.lists.find(l=>l.id === listId) ?? null;
		return testLists.find(l=>l.id === listId) ?? null;
	}

	const getCardsList = (cardId: string): List | null => {
		if(!sockCtx.boardData){
			return null;
		}
		let list: List | null = null;
		// sockCtx.boardData.lists.forEach(l=>{
		testLists.forEach(l=>{
			l.cards.forEach(c=>{
				if(c.id === cardId)
					list = l;
			})
		})
		return list;
	}

	function handleDragStart(event: DragStartEvent) {
		const {active} = event;
		if(getListIds().includes(active.id.toString())) {
			setActiveObject(getList(active.id.toString()));
		} else {
			 setActiveObject(getCard(active.id.toString()));
		}
		if(active.id){
			sockCtx.setDraggingObject({list: active.id.toString()});
		}
	}

	function handleDragOver(event: DragOverEvent) {
		// const {active, over} = event;
		// console.log("over", active.id.toString().substring(0, 2), over?.id.toString().substring(0, 2))
		// if (sockCtx.boardData?.lists && over && active.id !== over.id) {
		// 	const newIndex = sockCtx.boardData.lists.findIndex((v)=>v.id === over.id);
		// 	if(newIndex > -1){
		// 		sockCtx.moveListToPos(active.id.toString(), newIndex);
		// 	}
		// }
		const {active, over} = event;
		const overId = over?.id.toString() || null;
		const activeId = active.id.toString();

		if (overId == null || getListIds().includes(active.id.toString())) {
			return;
		}

		const overContainer = getCardsList(overId); 
		const activeContainer = getCardsList(activeId);

		if (!overContainer || !activeContainer) {
			return;
		}

		if (activeContainer === overContainer) {
			return
		}
		// setTestLists((prevTestLists) => {
		// 	const activeItems = prevTestLists[activeContainer];
		// 	const overItems = prevTestLists[overContainer];
		// 	const overIndex = overItems.indexOf(overId);
		// 	const activeIndex = activeItems.indexOf(active.id);

		// 	let newIndex: number;

		// 	if (overId in prevTestLists) {
		// 		newIndex = overItems.length + 1;
		// 	} else {
		// 		const isBelowOverItem =
		// 			over &&
		// 			active.rect.current.translated &&
		// 			active.rect.current.translated.top >
		// 			over.rect.top + over.rect.height;

		// 		const modifier = isBelowOverItem ? 1 : 0;

		// 		newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
		// 	}

		// 	recentlyMovedToNewContainer.current = true;

		// 	return {
		// 		...prevTestLists,
		// 		[activeContainer]: prevTestLists[activeContainer].filter(
		// 			(item) => item !== active.id
		// 		),
		// 		[overContainer]: [
		// 			...prevTestLists[overContainer].slice(0, newIndex),
		// 			prevTestLists[activeContainer][activeIndex],
		// 			...prevTestLists[overContainer].slice(
		// 				newIndex,
		// 				prevTestLists[overContainer].length
		// 			),
		// 		],
		// 	};
		// });
	}

	function handleDragEnd(event: DragEndEvent) {
		const {active, over} = event;
		// // console.log("end", active.id, over?.id)
		// sockCtx.setDraggingObject({});
		// setActiveObject(null);
		// if (sockCtx.boardData?.lists && over && active.id !== over.id) {
		// 	const newIndex = sockCtx.boardData.lists.findIndex((v)=>v.id === over.id);
		// 	if(newIndex > -1){
		// 		sockCtx.moveList(active.id.toString(), newIndex);
		// 	}
		// }


		console.log(active.id, over?.id);
		if (getListIds().includes(active.id.toString()) && over?.id) {
			setTestLists((prevTestLists) => {
				const activeIndex = prevTestLists.findIndex(l=>l.id === active.id);
				const overIndex = prevTestLists.findIndex(l=>l.id === over.id);
				const moved = arrayMove(prevTestLists, activeIndex, overIndex);
				console.log(prevTestLists, moved, activeIndex, overIndex);
				return moved;
			});
		}

		const activeContainer = getList(active.id.toString());

		if (!activeContainer) {
			setActiveObject(null);
			return;
		}	

		const overId = over?.id;

		if (overId == null) {
			setActiveObject(null);
			return;
		}

		const overContainer = getCardsList(overId.toString());

		if (overContainer) {
			const activeIndex = activeContainer.cards.findIndex(c=>c.id===active.id);
			const overIndex = activeContainer.cards.findIndex(c=>c.id===overId);

			if (activeIndex !== overIndex) {
				// setTestLists((prevTestLists) => ({


				// 	// ...items,
				// 	// [overContainer]: arrayMove(
				// 	// 	items[overContainer],
				// 	// 	activeIndex,
				// 	// 	overIndex
				// 	// ),

				// }));
			}
		}

		setActiveObject(null);
	}

	function handleDragAbort(event: DragAbortEvent) {
		console.log("abort", event.id)
		setActiveObject(null);
	}

	function handleDragCancel(event: DragCancelEvent) {
		const {active, over} = event;
		console.log("cancel", active.id, over?.id)
		setActiveObject(null);
	}

	const collisionDetectionStrategy: CollisionDetection = useCallback((args) => {
		if (activeObject && getListIds().includes(activeObject.id)) {
			return closestCenter({
				...args,
				droppableContainers: args.droppableContainers.filter(
					(container) => getListIds().includes(container.id.toString())
				),
			});
		}

		// Start by finding any intersecting droppable
		const pointerIntersections = pointerWithin(args);
		// If there are droppables intersecting with the pointer, return those 
		const intersections = pointerIntersections.length > 0 ? pointerIntersections : rectIntersection(args);
		let overId = getFirstCollision(intersections, 'id')?.toString() ?? null;

		if (overId != null) {

			if (getListIds().includes(overId)) {
				const containerItems = (activeObject as List).cards;

				// If a container is matched and it contains items (columns 'A', 'B', 'C')
				if (containerItems.length > 0) {
					// Return the closest droppable within that container
					overId = closestCenter({
						...args,
						droppableContainers: args.droppableContainers.filter((container) =>
							container.id !== overId && containerItems.find(c=>c.id === container.id.toString())
						),
					})[0]?.id.toString() ?? null;
				}
			}

			lastOverId.current = overId;

			return [{ id: overId }];
		}

		// When a draggable item moves to a new container, the layout may shift
		// and the `overId` may become `null`. We manually set the cached `lastOverId`
		// to the id of the draggable item that was moved to the new container, otherwise
		// the previous `overId` will be returned which can cause items to incorrectly shift positions
		if (recentlyMovedToNewContainer.current) {
			lastOverId.current = activeObject?.id ?? null;
		}

		// If no droppable is matched, return the last match
		return lastOverId.current ? [{ id: lastOverId.current }] : [];
	}, [activeObject, sockCtx.boardData?.lists] );

	// const collisionDetectionStrategy: CollisionDetection = (args) => {
	// 	if(args.active.data.current?.type === "list"){
	// 		return closestCenter({
	// 			...args,
	// 			droppableContainers: args.droppableContainers.filter((container) => getListIds().includes(container.id.toString())),
	// 		});
	// 	} else if(args.active.data.current?.type === "card"){
			
	// 	}

	// 	return [];
	// };

	const dropAnimation: DropAnimation = {
		sideEffects: defaultDropAnimationSideEffects({
		  styles: {
			active: {
			  opacity: '0.5',
			},
		  },
		}),
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
					collisionDetection={closestCenter}
					// collisionDetection={collisionDetectionStrategy}
					// modifiers={[restrictToHorizontalAxis, restrictToParentElement]}
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
						// items={sockCtx.boardData?.lists ?? []}
						items={testLists}
						strategy={horizontalListSortingStrategy}
					>{
						// sockCtx.boardData?.lists?.map((list: List, listIndex: number) => {
						testLists.map((list: List, listIndex: number) => {
							return (
								<SortableList
									key={list.id}
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
													key={cardIndex}
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
							? getListIds().includes(activeObject.id.toString())
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
			index={-1}
			dragging
		>
			{
				list.cards.map((card: Card, cardIndex: number) => {
					return (
						<CardElement
							key={cardIndex}
							cardType={card}
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
		/>
	);
}


export default BoardElement;
