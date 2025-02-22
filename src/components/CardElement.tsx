import React from "react";
import { useDisclosure } from "@mantine/hooks";
import { Group, Paper, Pill, Text, Title } from "@mantine/core";
import CardDetails from "@trz/components/CardDetails";
import {Card} from "@mosaiq/terrazzo-common/types";
import { AvatarRow } from "@trz/components/AvatarRow";
import { useTRZ } from "@trz/util/TRZ-context";


interface CardElementProps {
	cardType: Card;
	dragging: boolean;
	isOverlay: boolean;
}
const CardElement = (props: CardElementProps): React.JSX.Element => {
	const trzCtx = useTRZ();
	const testUsers = Array.from({ length: 1 }).map((_, index) => ({
		name: "John Doe",
		url: "https://avatars.githubusercontent.com/u/47070087?v=4"
	}))

	const onOpenCardModal = () => {
		if(props.dragging || props.isOverlay){
			return;
		}
		trzCtx.setOpenedCardModal(props.cardType.id);
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
				<Pill size="xs" bg='blue'>To Do</Pill>
				<Pill size="xs" bg='red'>In Progress</Pill>
			</Pill.Group>
			<Title 
				order={5} 
				lineClamp={7} 
				c="#ffffff"
				style={{
					wordWrap: "break-word",
					textWrap: "wrap"
				}}
			>{props.cardType.name}</Title>
			<Text size='xs' c="#878787">{props.cardType.id.substring(0,2)}  {"TRZ"} - {props.cardType.cardNumber}</Text>
			<Group>
				{/* icons for info abt the card */}
			</Group>
			<AvatarRow users={testUsers} maxUsers={3}/>
		</Paper>
	);
};
export default CardElement;
