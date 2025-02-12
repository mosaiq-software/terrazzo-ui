import React from "react";
import { useDisclosure } from "@mantine/hooks";
import { Group, Paper, Pill, Text, Title } from "@mantine/core";

import CardDetails from "@trz/components/CardDetails";
import {Card} from "@mosaiq/terrazzo-common/types";
import { AvatarRow } from "./AvatarRow";


interface CardElementProps {
	cardType: Card
}
const CardElement = (props: CardElementProps): React.JSX.Element => {
	const [opened, {open, close}] = useDisclosure(false);
	const MAX_USERS = 3;
	const testUsers = Array.from({ length: 1 }).map((_, index) => ({
		name: "John Doe",
		url: "https://avatars.githubusercontent.com/u/47070087?v=4"
	}))

	return (
		<>
			<Paper bg="#17191b" radius="md" p="sm" mx="xs" shadow="lg" bd="1px solid #757575" style={{ cursor: "pointer" }}
				onClick={open}
			>
				<Pill.Group>
					<Pill size="xs" color='blue'>To Do</Pill>
					<Pill size="xs" color='red'>In Progress</Pill>
				</Pill.Group>
				<Title order={6} lineClamp={1} c="#ffffff">{props.cardType.name}</Title>
				<Text size='sm' c="#878787">{props.cardType.cardNumber}</Text>
				<Group>
					{/* icons for info abt the card */}
				</Group>
				<AvatarRow users={testUsers} maxUsers={3}/>
			</Paper>
			{
				opened && (
					<CardDetails card={props.cardType} open={opened} toggle={close} boardCode={"TRZ"}/>
				)
			}
		</>
	);
};
export default CardElement;
