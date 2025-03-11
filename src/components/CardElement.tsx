import React, { useEffect, useState } from "react";
import {Box, Group, Paper, Pill, Text, Title} from "@mantine/core";
import {Card, CardId} from "@mosaiq/terrazzo-common/types";
import { AvatarRow } from "@trz/components/AvatarRow";
import {priorityColors} from "@trz/components/PriorityButtons";
import { CARD_CACHE_PREFIX, getCardNumber } from "@trz/util/boardUtils";
import { useSocketListener } from "@trz/hooks/useSocketListener";
import { ServerSE } from "@mosaiq/terrazzo-common/socketTypes";
import { updateBaseFromPartial } from "@mosaiq/terrazzo-common/utils/arrayUtils";
import { useSocket } from "@trz/contexts/socket-context";
import { getCardData } from "@trz/emitters/all";
import { NoteType, notify } from "@trz/util/notifications";
import { useInViewport, useSessionStorage } from "@mantine/hooks";

interface CardElementProps {
	cardId: CardId;
	dragging: boolean;
	isOverlay: boolean;
	boardCode: string;
	onClick: ()=>void;
}
const CardElement = (props: CardElementProps) => {
	const sockCtx = useSocket();
	const [card, setCard] = useState<Card | undefined>(undefined);
	const textColor = "#ffffff";
	const {ref: viewportRef, inViewport} = useInViewport();
	
	useEffect(()=>{
		let strictIgnore = false;
		const fetchCardData = async () => {
			await new Promise((resolve)=>setTimeout(resolve, 0));
			if(strictIgnore || !props.cardId || !sockCtx.connected || !inViewport){
				return;
			}
			if(inViewport && card && card.id === props.cardId){
				return;
			}
			try{
				const cachedCardRes = sessionStorage.getItem(`${CARD_CACHE_PREFIX}${props.cardId}`);
				if((props.dragging || props.isOverlay) && cachedCardRes){
					setCard(JSON.parse(cachedCardRes));
				} else {
					const cardRes = await getCardData(sockCtx, props.cardId);
					setCard(cardRes);
					if(cardRes){
						sessionStorage.setItem(`${CARD_CACHE_PREFIX}${props.cardId}`, JSON.stringify(cardRes))
					} else {
						sessionStorage.removeItem(`${CARD_CACHE_PREFIX}${props.cardId}`);
					}
				}
			} catch(err) {
				notify(NoteType.CARD_DATA_ERROR, err);
				return;
			}
		};
		fetchCardData();
		return ()=>{
			strictIgnore = true;
		}
	}, [props.cardId, sockCtx.connected, inViewport]);
	
	useSocketListener<ServerSE.UPDATE_CARD_FIELD>(ServerSE.UPDATE_CARD_FIELD, (payload)=>{
		if(payload.id !== props.cardId){
			return;
		}
		setCard((prev)=>{
			if(!prev){
				return prev;
			}
			return {...updateBaseFromPartial<Card>(prev, payload)};
		});
	});

	useSocketListener<ServerSE.UPDATE_CARD_ASSIGNEE>(ServerSE.UPDATE_CARD_ASSIGNEE, (payload)=>{

	});
	
	const onOpenCardModal = () => {
		if(!card || props.dragging || props.isOverlay){
			return;
		}
		props.onClick();
	}
	
	return (
		<Paper
			ref={viewportRef}
			bg="#17191b"
			radius="md"
			p="sm"
			shadow="lg"
			bd="1px solid #757575"
			mih="85px"
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
			{process.env.DEBUG==="true" && <Text fz="6pt">{props.cardId}</Text>}
			{card && inViewport && <React.Fragment>
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
				>{card.name}</Title>
				<Text
					size='xs'
					c="#878787"
					style={{
						userSelect: "none",
					}}
				>{getCardNumber(props.boardCode, card.cardNumber)}</Text>
				<Group justify='space-between' style={{flexDirection: "row-reverse"}}>
					{/* icons for info abt the card */}
					{card.assignees != undefined && card.assignees.length > 0 &&
						<AvatarRow users={card.assignees} maxUsers={3}/>
					}
					{card.priority &&
						<Box w='20' bg={priorityColors[card.priority - 1]}  style={{ '--radius': '0.3rem', borderRadius: 'var(--radius)' }}>
							<Text c="white" ta='center'>{card.priority}</Text>
						</Box>
					}
					{card.storyPoints &&
						<Box bg='#f2bb6e' w='20' style={{ '--radius': '0.3rem', borderRadius: 'var(--radius)' }}>
							<Text c='white' ta='center'>{card.storyPoints}</Text>
						</Box>
					}
				</Group>
			</React.Fragment>}
		</Paper>
	);
};
export default CardElement;