import React, {useEffect} from "react";
import {Box, Group, Paper, Pill, Text, Title} from "@mantine/core";
import {CardHeader} from "@mosaiq/terrazzo-common/types";
import { AvatarRow } from "@trz/components/AvatarRow";
import { useTRZ } from "@trz/util/TRZ-context";
import {priorityColors} from "@trz/components/PriorityButtons";

interface CardElementProps {
	cardHeader: CardHeader;
	dragging: boolean;
	isOverlay: boolean;
	boardCode: string;
}
const CardElement = (props: CardElementProps): React.JSX.Element => {
	const trzCtx = useTRZ();
	const [title, setTitle] = React.useState(props.cardHeader.name || "Card Title");
	const textColor = "#ffffff";

	useEffect(() => {
		setTitle(props.cardHeader.name);
	}, [props.cardHeader.name, props.cardHeader.priority]);

	const testUsers = Array.from({ length: 1 }).map((_, index) => ({
		name: "John Doe",
		url: "https://avatars.githubusercontent.com/u/47070087?v=4"
	}))

	const onOpenCardModal = () => {
		if(props.dragging || props.isOverlay){
			return;
		}
		trzCtx.setOpenedCardModal(props.cardHeader.id);
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
				<Pill size="xs" bg='#87cefa' c={textColor}>To Do</Pill>
				<Pill size="xs" bg='#ff474c' c={textColor}>In Progress</Pill>
			</Pill.Group>
			<Title 
				order={5} 
				lineClamp={7} 
				c="#ffffff"
				style={{
					wordWrap: "break-word",
					textWrap: "wrap"
				}}
			>{title}</Title>
			<Text size='xs' c="#878787">{props.boardCode} - {props.cardHeader.cardNumber}</Text>
			<Group justify='space-between' style={{flexDirection: "row-reverse"}}>
				{/* icons for info abt the card */}
                {props.cardHeader.assignees != undefined && props.cardHeader.assignees.length > 0 &&
                    <AvatarRow users={props.cardHeader.assignees} maxUsers={3}/>
                }
                {props.cardHeader.priority &&
                    <Box w='20' bg={priorityColors[props.cardHeader.priority - 1]}  style={{ '--radius': '0.3rem', borderRadius: 'var(--radius)' }}>
                        <Text c="white" ta='center'>{props.cardHeader.priority}</Text>
                    </Box>
                }
				{props.cardHeader.storyPoints &&
					<Box bg='#f2bb6e' w='20' style={{ '--radius': '0.3rem', borderRadius: 'var(--radius)' }}>
						<Text c='white' ta='center'>{props.cardHeader.storyPoints}</Text>
					</Box>
				}
			</Group>

		</Paper>
	);
};
export default CardElement;