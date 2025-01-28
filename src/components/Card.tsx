//Utility
import { useDisclosure } from "@mantine/hooks";
import { Avatar, Group, Paper, Pill, Text, Title, Tooltip } from "@mantine/core";
import React from "react";

//Components
import CardDetails from "@trz/components/CardDetails";
import { useTRZ } from "@trz/util/TRZ-context";
import { C } from "react-router/dist/production/fog-of-war-CbNQuoo8";

/**ListCard Component
 *
 * State => showDetails => boolean toggle functionality to show card details
 *
 * Props: none
 */

const Card = (): React.JSX.Element => {
	const [opened, {open, close}] = useDisclosure(false);
	const MAX_USERS = 3;
	const testUsers = Array.from({ length: (Math.floor(Math.random()*6)) }).map((_, index) => ({
		name: "John Doe",
		avatar: "https://avatars.githubusercontent.com/u/47070087?v=4"
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
				<Title order={6} lineClamp={1} c="#ffffff">Test Title</Title>
				<Text size='sm' c="#878787">TRZ-33</Text>
				<Group>
					{/* icons for info abt the card */}
				</Group>
				<Avatar.Group spacing="sm" style={{ justifyContent: "flex-end" }}>
					{
						// only take the first n users
						testUsers.slice(0, MAX_USERS).map((user, index) =>
							<Tooltip key={index} label={user.name} position="bottom" withArrow radius="lg">
								<Avatar src={user.avatar} size="sm" />
							</Tooltip>
						)
					}
					{
						// if there are more than n users, show a +{n} avatar
						testUsers.length > MAX_USERS && (
							<Tooltip position="bottom" withArrow radius="lg"
								label={
									testUsers.slice(MAX_USERS).map((user, index) =>
										<Text key={index}>{user.name}</Text>
									)
								}
							>
								<Avatar size="sm">+{testUsers.length - 3}</Avatar>
							</Tooltip>
						)
								
					}
				</Avatar.Group>
			</Paper>
			{
				opened && (
					<CardDetails id={123} open={opened} toggle={close} />
				)
			}
		</>
	);
};
export default Card;
