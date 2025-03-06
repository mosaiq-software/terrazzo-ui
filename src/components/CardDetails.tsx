import React, {useEffect} from "react";
import {Box, Button, Grid, Group, Menu, Modal, Pill, Stack, Text} from "@mantine/core";
import {CollaborativeTextArea} from "@trz/components/CollaborativeTextArea";
import {AvatarRow} from '@trz/components/AvatarRow';
import EditableTextbox from "@trz/components/EditableTextbox";
import {useSocket} from "@trz/contexts/socket-context";
import {NoteType, notify} from "@trz/util/notifications";
import { useTRZ } from "@trz/contexts/TRZ-context";
import { getCard } from "@trz/util/boardUtils";
import {FaArchive, FaUserPlus} from "react-icons/fa";
import {MdLabel, MdOutlinePriorityHigh} from "react-icons/md";
import {PriorityButtons, priorityColors} from "@trz/components/PriorityButtons";
import {Priority} from "@mosaiq/terrazzo-common/constants";
import {FaUserGroup} from "react-icons/fa6";
import {StoryPointButtons} from "@trz/components/StoryPointButtons";

const CardDetails = (): React.JSX.Element | null => {
	const trzCtx = useTRZ();
	const sockCtx = useSocket();
	const boardCode = sockCtx.boardData?.boardCode;
	const card = getCard(trzCtx.openedCardModal, sockCtx.boardData?.lists);
	const [title, setTitle] = React.useState<string>(card?.name || "Card Title");
	const [priorityColor, setPriorityColor] = React.useState<string>("");

	const bgColor = "#323a40";
	const bgDarkColor = "#22272b";
	const textColor = "#ffffff";
	const buttonColor = "#3b454c";
	const closeColor = "#9fadbc";

	useEffect(() => {
		setTitle(card?.name || "Card Title");
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
			sockCtx.updateCardField(card.id, {name: value});
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

	async function onJoinCard(){
		//TODO: Implement user joining card
	}

	async function onAssignCard(){
		//TODO: Implement to show all card members and add members to card
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
										<Text fz="sm">Members</Text>
										<Stack
											align='left'
											pt="xs"
										>
											<AvatarRow users={card.assignees} maxUsers={3}/>
										</Stack>
									</Grid.Col>
								}

								{ card?.storyPoints !=null && card?.storyPoints >-1 &&
									<Grid.Col span={4}>
										<Text fz="sm">Story Points</Text>
										<Stack
											align='left'
											pt="xs"
										>
											<Box bg='#f2bb6e' w='35' style={{ '--radius': '0.3rem', borderRadius: 'var(--radius)' }}>
												<Text c='white' ta='center'>{card?.storyPoints}</Text>
											</Box>
										</Stack>
									</Grid.Col>
								}

								{ card?.priority != null &&
									<Grid.Col span={4}>
										<Text fz="sm">Priority</Text>
										<Stack
											align='left'
											pt="xs"
										>
											<Box bg={priorityColor} w='35' style={{ '--radius': '0.3rem', borderRadius: 'var(--radius)' }}>
												<Text c='white' ta='center'>{card?.priority}</Text>
											</Box>
										</Stack>
									</Grid.Col>
								}
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
							<Button bg={buttonColor}
									leftSection={<FaUserPlus />}
									justify={"flex-start"}
									onClick={onJoinCard}
							>Join Card</Button>
							<Button bg={buttonColor}
									leftSection={<FaUserGroup />}
									justify={"flex-start"}
									onClick={onAssignCard}
							>Members</Button>
                            <Menu
								position='right-start'
								withArrow
								arrowPosition="center"
								withOverlay={true}
								closeOnClickOutside={true}
							>
                                <Menu.Target>
                                    <Button
										bg={buttonColor}
										leftSection={<MdOutlinePriorityHigh />}
										justify={"flex-start"}
									>Card Priority</Button>
                                </Menu.Target>
                                <Menu.Dropdown ta='center'>
                                    <Menu.Label>Card Priority</Menu.Label>
                                    <PriorityButtons/>
                                </Menu.Dropdown>
                            </Menu>
							<Menu
								position='right-start'
								withArrow
								arrowPosition="center"
								withOverlay={true}
								closeOnClickOutside={true}
							>
								<Menu.Target>
									<Button
										bg={buttonColor}
										justify={"flex-start"}
									>Story Points</Button>
								</Menu.Target>
								<Menu.Dropdown ta='center'>
									<Menu.Label>Story Points</Menu.Label>
									<StoryPointButtons/>
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