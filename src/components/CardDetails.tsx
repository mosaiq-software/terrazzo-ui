import React from "react";
import {
	Select,
	Group,
	Grid,
	Stack,
	Button,
	Menu,
	Modal,
	Text,
	Pill,
} from "@mantine/core";
import { CollaborativeTextArea } from "@trz/components/CollaborativeTextArea";
import { Card } from "@mosaiq/terrazzo-common/types";
import { AvatarRow } from '@trz/components/AvatarRow';
import EditableTextbox from "@trz/components/EditableTextbox";

interface CardDetailsProps {
	boardCode: string;
	card: Card;
	toggle: () => void;
	open: boolean;
}
const CardDetails = (props: CardDetailsProps): React.JSX.Element => {
	return (
		<Modal.Root
			opened={props.open}
			onClose={props.toggle}
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
				<Modal.Header>
					<Modal.Title
						w={"100%"}
					>
					<EditableTextbox 
							value={props.card.name} 
							onChange={()=>{}}
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
						<Text fz="sm">{props.boardCode} - {props.card.cardNumber}</Text>
					</Modal.Title>
					<Modal.CloseButton />
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
							<CollaborativeTextArea textBlockId={props.card.descriptionTextBlockId} maxLineLength={66} />
						</Stack>
						<Stack justify='flex-start' align='stretch' pt="md">
							<Menu>
								<Menu.Target>
									<Button bg='gray.8'>Menu 1</Button>
								</Menu.Target>
								<Menu.Dropdown>
									<Menu.Label>Placeholder 1</Menu.Label>
									<Menu.Item>Placeholder 1 Item</Menu.Item>
									<Menu.Label>Placeholder 2</Menu.Label>
									<Menu.Item>Placeholder 2 Item</Menu.Item>
								</Menu.Dropdown>
							</Menu>
						</Stack>
					</Group>
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	);
};

export default CardDetails;
