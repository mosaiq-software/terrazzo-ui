import React, {useEffect} from "react";
import {Box, Group, Paper, Pill, Text, Title} from "@mantine/core";
import {Card} from "@mosaiq/terrazzo-common/types";
import { AvatarRow } from "@trz/components/AvatarRow";
import { useTRZ } from "@trz/contexts/TRZ-context";
import {priorityColors} from "@trz/components/PriorityButtons";
import { getCardNumber } from "@trz/util/boardUtils";

interface CardElementProps {
	card: Card;
	dragging: boolean;
	isOverlay: boolean;
	boardCode: string;
	onClick: ()=>void;
}
const CardElement = (props: CardElementProps): React.JSX.Element => {
	const trzCtx = useTRZ();
	const textColor = "#ffffff";

	const onOpenCardModal = () => {
		if(props.dragging || props.isOverlay){
			return;
		}
		props.onClick();
	}

	return (
		<Paper
			bg="#17191b"
			radius="md"
			p="sm"
			shadow="lg"
			bd="1px solid #757575"
			style={{
				cursor: "pointer",
				marginInline: "5px",
				width: "230px",
				transition: `transform .1s, box-shadow .1s, filter 0ms linear ${props.dragging ? '0ms' : '225ms'}`,
				...(props.dragging ? props.isOverlay ? {
					transform: "rotateZ(3deg) scale(1.02)",
					boxShadow: "10px 8px 25px black",
					border: "1px solid #14222e",
					zIndex: 12,
			} : {
					filter: "grayscale(1) contrast(0) brightness(0) blur(6px)",
					opacity: .4,
					zIndex: 11,
			} : undefined)
			}}
			onClick={onOpenCardModal}
		>
			<Pill.Group>
				<Pill
					size="xs"
					bg='#87cefa'
					c={textColor}
					style={{
						userSelect: "none",
					}}
				>To Do</Pill>
				<Pill
					size="xs"
					bg='#ff474c'
					c={textColor}
					style={{
						userSelect: "none",
					}}
				>In Progress</Pill>
			</Pill.Group>
			<Title 
				order={5} 
				lineClamp={7} 
				c="#ffffff"
				style={{
					wordWrap: "break-word",
					textWrap: "wrap",
					userSelect: "none",
				}}
			>{props.card.name}</Title>
			<Text
				size='xs'
				c="#878787"
				style={{
					userSelect: "none",
				}}
			>{getCardNumber(props.boardCode, props.card.cardNumber)}</Text>
			<Group justify='space-between' style={{flexDirection: "row-reverse"}}>
				{/* icons for info abt the card */}
                {props.card.assignees != undefined && props.card.assignees.length > 0 &&
                    <AvatarRow users={props.card.assignees} maxUsers={3}/>
                }
                {props.card.priority &&
                    <Box w='20' bg={priorityColors[props.card.priority - 1]}  style={{ '--radius': '0.3rem', borderRadius: 'var(--radius)' }}>
                        <Text c="white" ta='center'>{props.card.priority}</Text>
                    </Box>
                }
				{props.card.storyPoints &&
					<Box bg='#f2bb6e' w='20' style={{ '--radius': '0.3rem', borderRadius: 'var(--radius)' }}>
						<Text c='white' ta='center'>{props.card.storyPoints}</Text>
					</Box>
				}
			</Group>

		</Paper>
	);
};
export default CardElement;