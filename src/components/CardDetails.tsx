import React, {useEffect} from "react";
import {Select, Group, Grid, Stack, Button, Modal, Text, Pill, Box} from "@mantine/core";
import { CollaborativeTextArea } from "@trz/components/CollaborativeTextArea";
import { AvatarRow } from '@trz/components/AvatarRow';
import EditableTextbox from "@trz/components/EditableTextbox";
import {useSocket} from "@trz/util/socket-context";
import {NoteType, notify} from "@trz/util/notifications";
import { useTRZ } from "@trz/util/TRZ-context";
import { getCard } from "@trz/util/boardUtils";

interface CardDetailsProps {
}
const CardDetails = (props: CardDetailsProps): React.JSX.Element | null => {
	const trzCtx = useTRZ();
	const sockCtx = useSocket();
	const boardCode = sockCtx.boardData?.boardCode;
	let card = getCard(trzCtx.openedCardModal, sockCtx.boardData?.lists);
	const [title, setTitle] = React.useState<string>(card?.name || "Card Title");

	useEffect(() => {
		card = getCard(trzCtx.openedCardModal, sockCtx.boardData?.lists);
		setTitle(card?.name || "Card Title");
	}, [card, sockCtx.boardData]);

	const isOpen = !!trzCtx.openedCardModal;
	
	const onCloseModal = () => {
		trzCtx.setOpenedCardModal(null);
	}

	async function onTitleChange(value:string) {
		if(!card){
			notify(NoteType.CARD_UPDATE_ERROR);
			return;
		}
		try{
			await sockCtx.updateCardField(card.id, {name: value});
			setTitle(value);
		} catch (e) {
			notify(NoteType.CARD_UPDATE_ERROR, e);
			return;
		}
	}

	if(!sockCtx.boardData || !trzCtx.openedCardModal){
		return null;
	}

	if(!card) {
		console.error("No card found when opening card details modal");
		onCloseModal();
		return null;
	}

	return (
		<Modal.Root
			opened={isOpen}
			onClose={onCloseModal}
			centered
			size={"auto"}
		>
			<Modal.Overlay
				backgroundOpacity= {0.5}
				blur= {3}
			/>
			<Modal.Content
				h={"90vh"}
				style={{
					overflowX: "hidden",
					overflowY: "scroll"
				}}
			>
				<Modal.Header p="0">
					<Modal.Title
						w={"100%"}
					>
						<Group justify="space-between">
							<Stack
								w="100%"
								gap="xs"
							>
								{
									card.archived &&
									<Box
										bg="yellow"
										p="sm"
									>
										<Group
											justify="space-between"
										>
											<Text fz="xl">This card is archived.</Text>
										</Group>
									</Box>
								}
								<Stack
									gap="xs"
									align="flex-start"
									justify="flex-start"
									p="sm"
								>
									<EditableTextbox
										value={title}
										onChange={onTitleChange}
										type="title"
										placeholder="Card name.."
										titleProps={{
											order:3,
											textWrap: "nowrap"
										}}
										inputProps={{
											w:"100%"
										}}
									/>
									<Text fz="sm">{boardCode} - {card.cardNumber}</Text>
								</Stack>
							</Stack>
						</Group>
						<Modal.CloseButton
							variant="transparent"
							style={{
								position: "absolute",
								top: "0.75rem",
								right: "0.75rem",
								hover: "green",
							}}
						/>

					</Modal.Title>
				</Modal.Header>
				<Modal.Body
					p={20}
				>
					<Group 
						grow 
						preventGrowOverflow={false}
						wrap='nowrap'
						align="flex-start"
					>
						<Stack style={{
						}}>
							<Grid style={{
								padding: "1rem",
							}}>
								<Grid.Col span={4}>
									<Stack align='left'>
										<Text fz="sm">Members</Text>
										<AvatarRow users={[]} maxUsers={3}/>
									</Stack>
								</Grid.Col>
										
								<Grid.Col span={4}>
									<Stack align='left'>
										<Select label='Priority' placeholder='Low' data={["Low", "Medium", "High"]} />
									</Stack>
								</Grid.Col>
								<Grid.Col span={4}>
									<Pill.Group>
										<Pill size="xs" bg='blue'>To Do</Pill>
										<Pill size="xs" bg='red'>In Progress</Pill>
									</Pill.Group>
								</Grid.Col>
							</Grid>
							<CollaborativeTextArea textBlockId={card.descriptionTextBlockId} maxLineLength={66} />
						</Stack>
						<Stack justify='flex-start' align='stretch' pt="md">
							{
								!card.archived &&
								<Button bg='gray.8'
										onClick={() => {
											if(card){
												sockCtx.updateCardField(card.id, {archived: true});
											}
											onCloseModal();
										}}
								>Archive card</Button>
							}
							{
								card.archived &&
								<Button bg='gray.8'
										onClick={() => {
											if(card){
												sockCtx.updateCardField(card.id, {archived: true});
											}
											onCloseModal();
										}}
								>Delete card</Button>
							}
						</Stack>
					</Group>
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	);
};

export default CardDetails;
