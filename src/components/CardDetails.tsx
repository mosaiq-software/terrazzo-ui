import React, {useEffect, useState} from "react";
import {Box, Button, Combobox, Grid, Group, Menu, Modal, Pill, Stack, Text, useCombobox} from "@mantine/core";
import {CollaborativeTextArea} from "@trz/components/CollaborativeTextArea";
import {AvatarRow} from '@trz/components/AvatarRow';
import EditableTextbox from "@trz/components/EditableTextbox";
import {useSocket} from "@trz/contexts/socket-context";
import {NoteType, notify} from "@trz/util/notifications";
import { useTRZ } from "@trz/contexts/TRZ-context";
import { getCardNumber } from "@trz/util/boardUtils";
import {FaArchive, FaUserPlus} from "react-icons/fa";
import {MdLabel, MdOutlinePriorityHigh} from "react-icons/md";
import {PriorityButtons, priorityColors} from "@trz/components/PriorityButtons";
import {Priority} from "@mosaiq/terrazzo-common/constants";
import {StoryPointButtons} from "@trz/components/StoryPointButtons";
import { Card, CardId, UserId } from "@mosaiq/terrazzo-common/types";
import { useUser } from "@trz/contexts/user-context";
import { getRoomCode } from "@mosaiq/terrazzo-common/utils/socketUtils";
import { RoomType } from "@mosaiq/terrazzo-common/socketTypes";
import {MarkdownTextarea} from "@trz/components/MarkdownTextarea";
import { updateCardField } from "@trz/emitters/all";
interface CardDetailsProps {
	cardId: CardId;
	boardCode: string;
	onClose: ()=>void;
}
const CardDetails = (props: CardDetailsProps): React.JSX.Element | null => {
	const [card, setCard] = useState<Card | null>(null);
	const trzCtx = useTRZ();
	const sockCtx = useSocket();
	const usr = useUser();
	const [editingDescription, setEditingDescription] = useState<boolean>(false);
	const combobox = useCombobox({
	  onDropdownClose: () => combobox.resetSelectedOption(),
	});

	const bgColor = "#323a40";
	const bgDarkColor = "#22272b";
	const textColor = "#ffffff";
	const buttonColor = "#3b454c";
	const closeColor = "#9fadbc";

	const onCloseModal = () => {
		if(editingDescription){
			setEditingDescription(false);
			return;
		}
		props.onClose();
	}

	async function onTitleChange(value:string) {
		if(!card){
			notify(NoteType.CARD_UPDATE_ERROR);
			return;
		}
		try{
			updateCardField(sockCtx, card.id, {name: value});
		} catch (e) {
			notify(NoteType.CARD_UPDATE_ERROR, e);
			return;
		}
	}

	async function onArchiveCard(archive: boolean) {
		if(!card){
			notify(NoteType.CARD_UPDATE_ERROR);
			return;
		}
		if(archive){
			await updateCardField(sockCtx, card.id, {archived: archive, order: -1});
		}else {
			await updateCardField(sockCtx, card.id, {archived: archive, order: 0});
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

	if(!props.cardId){
		return null;
	}

	if(!card) {
		console.error("No card found when opening card details modal");
		onCloseModal();
		return null;
	}

	const joinedCard = !!usr.userData && card.assignees.includes(usr.userData.id)

	return (
		<Modal.Root
			opened
			closeOnClickOutside
			onClose={onCloseModal}
			centered
			size={"800px"}
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
										value={card.name}
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
									<Text fz="sm">{getCardNumber(props.boardCode, card.cardNumber)}</Text>
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
						justify="space-between"
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

								{ card.storyPoints !=null && card.storyPoints >-1 &&
									<Grid.Col span={4}>
										<Text fz="sm">Story Points</Text>
										<Stack
											align='left'
											pt="xs"
										>
											<Box bg='#f2bb6e' w='35' style={{ '--radius': '0.3rem', borderRadius: 'var(--radius)' }}>
												<Text c='white' ta='center'>{card.storyPoints}</Text>
											</Box>
										</Stack>
									</Grid.Col>
								}

								{ card.priority != null &&
									<Grid.Col span={4}>
										<Text fz="sm">Priority</Text>
										<Stack
											align='left'
											pt="xs"
										>
											<Box bg={priorityColors[card.priority - 1]} w='35' style={{ '--radius': '0.3rem', borderRadius: 'var(--radius)' }}>
												<Text c='white' ta='center'>{card.priority}</Text>
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
							<Box>
								{
									editingDescription &&
									<CollaborativeTextArea
										textBlockId={card.descriptionTextBlockId}
										maxLineLength={60}
										textColor={textColor}
										backgroundColor={bgDarkColor}
										onClose={()=>{
											setEditingDescription(false);
										}}
									/>
								}
								{
									!editingDescription && !!sockCtx.collaborativeTextObject?.text?.length &&
									<MarkdownTextarea
										style={{ cursor: 'text' }}
										onDoubleClick={()=>{
											setEditingDescription(true);
										}}
									>
										{sockCtx.collaborativeTextObject.text}
									</MarkdownTextarea>
								}
								{
									!editingDescription && !sockCtx.collaborativeTextObject?.text?.length &&
									<MarkdownTextarea
										style={{ cursor: 'text', color:"#aaa"}}
										onDoubleClick={()=>{
											setEditingDescription(true);
										}}
									>
										{"**Double Click** to add a description"}
									</MarkdownTextarea>
								}
								<Button
									key={editingDescription ? "Done" : "Edit"}
									mt="1rem"
									onClick={()=>{
										setEditingDescription(!editingDescription);
									}}
								>
									{editingDescription ? "Done" : "Edit"}
								</Button>
							</Box>
						</Stack>
						<Stack justify='flex-start' align='stretch' pt="md" maw="140px">
							<Button bg={buttonColor}
									leftSection={<FaUserPlus />}
									justify={"flex-start"}
									onClick={()=>{
										if(usr.userData){
											// updateCardAssignee(card.id, usr.userData.id, !joinedCard);
										}
									}}
							>{joinedCard ? "Leave" : "Join"} Card</Button>
							{/* <Combobox
								store={combobox}
								width={550}
								position="bottom-start"
								withArrow
								withinPortal={false}
								onOptionSubmit={async (val) => {
									await sockCtx.updateCardAssignee(card.id, val as UserId, card.assignees.includes(card.id));
								}}
							>
								<Combobox.Target>
									<Button bg={buttonColor}
										leftSection={<FaUserGroup />}
										justify={"flex-start"}
										onClick={()=>{
											combobox.toggleDropdown();
										}}
									>Members</Button>
								</Combobox.Target>

								<Combobox.Dropdown>
									<Combobox.Options>
										
											{sockCtx.orgData?.members.map(m=>(
												<Combobox.Option value={m.user.id} key={m.user.id}>
													{m.user.username}
												</Combobox.Option>
											))}
									</Combobox.Options>
								</Combobox.Dropdown>
							</Combobox> */}
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
                                    <PriorityButtons cardId={card.id}/>
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
									<StoryPointButtons cardId={card.id}/>
								</Menu.Dropdown>
							</Menu>
                            <Button bg={buttonColor}
									leftSection={<MdLabel />}
									justify={"flex-start"}
									onClick={onChangeLabels}
							>Labels</Button>
							{
								<Button key={card.archived ? "Unarchive" : "Archive"}
										bg={buttonColor}
										leftSection={<FaArchive />}
										justify={"flex-start"}
										onClick={() => onArchiveCard(!card.archived)}
								>{card.archived ? "Unarchive" : "Archive"} card</Button>
							}
						</Stack>
					</Group>
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	);
};

export default CardDetails;