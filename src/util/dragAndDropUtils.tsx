import React from "react";
import CardElement from "@trz/components/CardElement";
import ListElement from "@trz/components/ListElement";
import {List, Card} from "@mosaiq/terrazzo-common/types";
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
                intersectingId = l.id.toString();
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

export function renderContainerDragOverlay(list: List) {
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

export function renderSortableItemDragOverlay(card: Card) {
	return (
		<CardElement
			cardType={card}
			dragging={true}
			isOverlay={true}
		/>
	);
}