import React from "react";
import CardElement from "@trz/components/CardElement";
import ListElement from "@trz/components/ListElement";
import {List, Card, CardHeader, UID} from "@mosaiq/terrazzo-common/types";
import { defaultDropAnimationSideEffects, DropAnimation } from "@dnd-kit/core";

export const horizontalCollisionDetection = (args): string | null => {
    // Get the horizontally closest list
    const ptrCrds = args.pointerCoordinates;
    let intersectingId: string | null = null;
    let minDelta = 10000000;
    args.droppableContainers.forEach((l)=>{
        if(ptrCrds && l.rect.current){
            const center = l.rect.current.left + (l.rect.current.width / 2.0);
            const delta = Math.abs(center - ptrCrds.x);
            if(delta < minDelta){
                intersectingId = l.id.toString() as UID;
                minDelta = delta;
            }
        }
    });

    return intersectingId;
}

export const boardDropAnimation: DropAnimation = {
	sideEffects: defaultDropAnimationSideEffects({
		styles: {
			active: {
				opacity: '0.5',
			},
		},
	}),
};

export function renderContainerDragOverlay(list: List, boardCode: string) {
	return (
		<ListElement
			listType={list}
			dragging
			isOverlay={true}
		>
			{
				list.cards.map((card, cardIndex) => {
					return (
						<CardElement
							key={cardIndex}
							card={card}
							dragging={false}
							isOverlay={false}
							boardCode={boardCode}
							onClick={()=>{}}
						/>
					);
				})
			}
		</ListElement>
	);
}

export function renderSortableItemDragOverlay(card: Card, boardCode: string) {
	return (
		<CardElement
			card={card}
			dragging={true}
			isOverlay={true}
			boardCode={boardCode}
			onClick={()=>{}}
		/>
	);
}