import React, {useEffect, useState} from "react";
import {Box, Button, Center, Checkbox, Combobox, Grid, Group, Loader, Menu, Modal, Pill, Stack, Text, useCombobox} from "@mantine/core";
import {CollaborativeTextArea} from "@trz/components/CollaborativeTextArea/CollaborativeTextArea";
import {AvatarRow} from '@trz/components/AvatarRow';
import EditableTextbox from "@trz/components/EditableTextbox";
import {useSocket} from "@trz/contexts/socket-context";
import {NoteType, notify} from "@trz/util/notifications";
import { useTRZ } from "@trz/contexts/TRZ-context";
import { getCardNumber } from "@trz/util/boardUtils";
import {FaArchive, FaUserPlus} from "react-icons/fa";
import {MdLabel, MdOutlinePriorityHigh} from "react-icons/md";
import {PriorityButtons, priorityColors, unicodeMap} from "@trz/components/PriorityButtons";
import {Priority} from "@mosaiq/terrazzo-common/constants";
import {StoryPointButtons} from "@trz/components/StoryPointButtons";
import { Card, CardId, UserId } from "@mosaiq/terrazzo-common/types";
import { useUser } from "@trz/contexts/user-context";
import { ServerSE } from "@mosaiq/terrazzo-common/socketTypes";
import { getCardData, updateCardField, updateCardsLabels } from "@trz/emitters/all";
import { useSocketListener } from "@trz/hooks/useSocketListener";
import { updateBaseFromPartial } from "@mosaiq/terrazzo-common/utils/arrayUtils";
import { colorIsDarkAdvanced } from "@trz/util/colorUtils";
import { useIdle } from "@mantine/hooks";
import { IDLE_TIMEOUT_MS } from "@trz/util/textUtils";
import { fullName } from "@mosaiq/terrazzo-common/utils/textUtils";
import { LabelsMenu } from "./LabelsMenu";

interface CardDetailsProps {
	cardId: CardId;
	boardCode: string;
	onClose: ()=>void;
}
const CardDetails = (props: CardDetailsProps): React.JSX.Element | null => {
	const [card, setCard] = useState<Card | undefined>(undefined);
	const trzCtx = useTRZ();
	const sockCtx = useSocket();
	const usr = useUser();
	const combobox = useCombobox({
	  onDropdownClose: () => combobox.resetSelectedOption(),
	});
    const idle = useIdle(IDLE_TIMEOUT_MS);

	useEffect(()=>{
		let strictIgnore = false;
		const fetchCardData = async () => {
			await new Promise((resolve)=>setTimeout(resolve, 0));
			if(strictIgnore || !props.cardId || !sockCtx.connected){
				return;
			}
			try{
				const cardRes = await getCardData(sockCtx, props.cardId);
				if(!cardRes) {
					notify(NoteType.CARD_DATA_ERROR, "Not found");
					props.onClose();
				}
				setCard(cardRes);
			} catch(err) {
				notify(NoteType.CARD_DATA_ERROR, err);
				return;
			}
		};
		fetchCardData();
		return ()=>{
			strictIgnore = true;
		}
	}, [props.cardId, sockCtx.connected]);
	
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

	useSocketListener<ServerSE.UPDATE_CARDS_LABELS>(ServerSE.UPDATE_CARDS_LABELS, (payload)=>{
		if(payload.cardId !== props.cardId){
			return;
		}
		setCard((prev)=>{
			if(!prev){
				return prev;
			}
			prev.labels = payload.labelIds;
			return {...prev};
		});
	});
	
	useSocketListener<ServerSE.UPDATE_CARD_ASSIGNEE>(ServerSE.UPDATE_CARD_ASSIGNEE, (payload)=>{

	});

	const onCloseModal = () => {
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

	if(!props.cardId){
		return null;
	}

	const joinedCard = !!usr.userData && card?.assignees.includes(usr.userData.id)

    if(!card){
        return (
            <Center>
                <Stack align="center">
                    <Loader type="bars"/>
                    <Text ta="center">Loading...</Text>
                </Stack>
            </Center>
        )
    }

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
				bg={"red"}
				c={"red"}
				style={{
					overflowX: "hidden",
					overflowY: "scroll"
				}}
			>
				<Modal.Header
					p="0"
					bg={"red"}
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
									card?.archived &&
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
								{card && <Stack
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
                                            fw: 400,
										}}
										inputProps={{
											w:"100%",
											bg: "red",
										}}
										style={{
											width: "95%",
										}}
									/>
									<Text fz="sm">{getCardNumber(props.boardCode, card.cardNumber)}</Text>
								</Stack>}
							</Stack>
						</Group>
						<Modal.CloseButton
							variant="transparent"
							c={"red"}
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
                                <PriorityButtons card={card} />
								<LabelsMenu card={card} />
							</Grid>
							<CollaborativeTextArea
								textBlockId={card.descriptionTextBlockId}
								maxLineLength={60}
								placeholder="Add a more detailed description..."
                                idle={idle}
                                name={fullName(usr.userData)}
                                avatarUrl={usr.userData?.profilePicture}
							/>
                            <Stack>
                                <Text>
                                    Created at {new Date(card.createdAt).toLocaleString()} by {fullName(card.createdBy)}
                                </Text>
                            </Stack>
						</Stack>
						<Stack justify='flex-start' align='stretch' pt="md" maw="140px">
							<Button 
                                bg={"red"}
                                leftSection={<FaUserPlus />}
                                justify={"flex-start"}
                                onClick={()=>{
                                    if(usr.userData){
                                        // updateCardAssignee(card.id, usr.userData.id, !joinedCard);
                                    }
                                }}
							>
                                {joinedCard ? "Leave" : "Join"} Card
                            </Button>
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
							{
								<Button 
                                    key={card.archived ? "Unarchive" : "Archive"}
                                    bg={"red"}
                                    leftSection={<FaArchive />}
                                    justify={"flex-start"}
                                    onClick={() => onArchiveCard(!card.archived)}
								>
                                    {card.archived ? "Unarchive" : "Archive"} card
                                </Button>
							}
						</Stack>
					</Group>
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	);
};

export default CardDetails;