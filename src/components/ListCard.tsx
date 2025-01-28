//Utility
import { useDisclosure, useToggle } from "@mantine/hooks";
import {  Group, Paper, Pill, Text, Title } from "@mantine/core";
import React, { useState } from "react";

//Components
import CardDetails from "@trz/components/CardDetails";
import { Avatar } from "@mantine/core";

/**ListCard Component
 *
 * State => showDetails => boolean toggle functionality to show card details
 *
 * Props: none
 */

const ListCard = (): React.JSX.Element => {
	const [opened, {open, close}] = useDisclosure(false);

	return (
		<>
			<Paper bg="#17191b" radius="md" p="sm" mx="xs" shadow="lg" bd="1px solid #757575">
				<Pill.Group>
					<Pill size="xs" color='blue'>To Do</Pill>
					<Pill size="xs" color='red'>In Progress</Pill>
				</Pill.Group>
				<Title order={6} lineClamp={1} c="#ffffff">Test Title</Title>
				<Text size='sm' c="#878787">TRZ-33</Text>
				<Group>
					{/* icons for info abt the card */}
				</Group>
				<Group>
					<Avatar size="sm" src="https://avatars.githubusercontent.com/u/47070087?v=4"/>
					<Avatar size="sm" src="https://avatars.githubusercontent.com/u/47070087?v=4"/>
					<Avatar size="sm" src="https://avatars.githubusercontent.com/u/47070087?v=4"/>
				</Group>
			</Paper>
			{
				opened && (
					<CardDetails id={123} open={opened} toggle={close} />
				)
			}
		</>
	);
};
export default ListCard;
