import React, {useEffect} from "react";
import {Box, Button, Grid, Group, Menu, Modal, Pill, Stack, Text} from "@mantine/core";
import {CollaborativeTextArea} from "@trz/components/CollaborativeTextArea";
import {AvatarRow} from '@trz/components/AvatarRow';
import EditableTextbox from "@trz/components/EditableTextbox";
import {useSocket} from "@trz/util/socket-context";
import {NoteType, notify} from "@trz/util/notifications";
import { useTRZ } from "@trz/util/TRZ-context";
import { getCard } from "@trz/util/boardUtils";
import {FaArchive} from "react-icons/fa";
import {MdLabel} from "react-icons/md";
import {PriorityButtons, priorityColors} from "@trz/components/PriorityButtons";
import {Priority} from "@mosaiq/terrazzo-common/constants";

const CardDetails = (): React.JSX.Element | null => {
	const trzCtx = useTRZ();
	const sockCtx = useSocket();
	const boardCode = sockCtx.boardData?.boardCode;
	let card = getCard(trzCtx.openedCardModal, sockCtx.boardData?.lists);
	const [title, setTitle] = React.useState<string>(card?.name || "Card Title");
	const [priorityNumber, setPriorityNumber] = React.useState<Priority | null>(card?.priority || null);
	const [priorityColor, setPriorityColor] = React.useState<string>("");

	const bgColor = "#323a40";
	const bgDarkColor = "#22272b";
	const textColor = "#ffffff";
	const buttonColor = "#3b454c";
	const closeColor = "#9fadbc";

	useEffect(() => {
		card = getCard(trzCtx.openedCardModal, sockCtx.boardData?.lists);
		setTitle(card?.name || "Card Title");
		if(card?.priority){
			setPriorityNumber(card?.priority);
		}
		else{
			setPriorityNumber(null);
		}
		onPriorityChange(card?.priority || Priority.LOW);
	}, [card]);

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

	const onPriorityChange = (value:Priority) => {
		setPriorityColor(priorityColors[value - 1]);
	}

	async function onArchiveCard(archive: boolean) {
		if(!card){
			notify(NoteType.CARD_UPDATE_ERROR);
			return;
		}
		if(archive){
			await sockCtx.updateCardField(card.id, {archived: archive, order: -1});
		}else {
			await sockCtx.updateCardField(card.id, {archived: archive, order: 0});
		}
		onCloseModal();//this wont run ever due to sockCtx.boardData being updated
	}

	async function onChangeLabels() {
		//TODO: Implement Change label
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
				bg={bgColor}
				c={textColor}
				style={{
					overflowX: "hidden",
					overflowY: "scroll"
				}}
			>
				<Modal.Header
					p="0"
					bg={bgColor}
				>
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
									pt="lg"
									pl="lg"
									pr="lg"
								>
									<EditableTextbox
										value={title}
										onChange={onTitleChange}
										type="title"
										placeholder="Card name.."
										titleProps={{
											order:3,
											textWrap: "nowrap",
										}}
										inputProps={{
											w:"100%",
											bg: bgDarkColor,
										}}
										style={{
											width: "95%",
										}}
									/>
									<Text fz="sm">{boardCode} - {card.cardNumber}</Text>
								</Stack>
							</Stack>
						</Group>
						<Modal.CloseButton
							variant="transparent"
							c={closeColor}
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
							<Grid
								pb="lg"
								pr="lg"
							>
								{card.assignees != undefined && card.assignees.length > 0 &&
									<Grid.Col span={4}>
										<Stack align='left'>
											<Text fz="sm">Members</Text>
											<AvatarRow users={card.assignees} maxUsers={3}/>
										</Stack>
									</Grid.Col>
								}
								<Grid.Col span={4}>
									<Stack align='left'>
										<Text fz="sm">Priority</Text>
										{ priorityNumber != null &&
											<Box bg={priorityColor} w='35' style={{ '--radius': '0.3rem', borderRadius: 'var(--radius)' }}>
												<Text c='white' ta='center'>{priorityNumber}</Text>
											</Box>
										}
									</Stack>
								</Grid.Col>
								<Grid.Col span={4}>
									<Text fz="sm">Labels</Text>
									<Pill.Group
										pt="xs"
									>
										<Pill size="md" bg='#87cefa' c={textColor}>To Do</Pill>
										<Pill size="md" bg='#ff474c' c={textColor}>In Progress</Pill>
									</Pill.Group>
								</Grid.Col>
							</Grid>
							<CollaborativeTextArea
								textBlockId={card.descriptionTextBlockId}
								maxLineLength={66}
								textColor={textColor}
								backgroundColor={bgDarkColor}
							/>
						</Stack>
						<Stack justify='flex-start' align='stretch' pt="md" >
                            <Menu position='bottom-start'>
                                <Menu.Target>
                                    <Button bg='gray.8'>Card Priority</Button>
                                </Menu.Target>
                                <Menu.Dropdown ta='center'>
                                    <Menu.Label>Card Priority</Menu.Label>
                                    <PriorityButtons/>
                                </Menu.Dropdown>
                            </Menu>
                            <Button bg={buttonColor}
									leftSection={<MdLabel />}
									justify={"flex-start"}
									onClick={onChangeLabels}
							>Labels</Button>
							{
								!card.archived &&
								<Button bg={buttonColor}
										leftSection={<FaArchive />}
										justify={"flex-start"}
										onClick={() => onArchiveCard(true)}
								>Archive card</Button>
							}
							{
								card.archived &&
								<Button bg={buttonColor}
										leftSection={<FaArchive />}
										justify={"flex-start"}
										onClick={() => onArchiveCard(false)}
								>Unarchived card</Button>
							}
						</Stack>
					</Group>
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	);
};

export default CardDetails;