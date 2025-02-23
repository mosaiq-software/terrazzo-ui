import React, {useEffect} from "react";
import {Button, Center, Container, Paper, Space, Stack, Text, TextInput, Title} from "@mantine/core";
import {useSocket} from "@trz/util/socket-context";
import {useUser} from "@trz/contexts/user-context";
import {useDebouncedValue} from "@mantine/hooks";

export const SetUpAccount = () => {
    const [username, setUsername] = React.useState("");
    const [usernameDebounce] = useDebouncedValue(username, 500);
    const [firstName, setFirstName] = React.useState("");
    const [lastName, setLastName] = React.useState("");
    const [errorUsername, setErrorUsername] = React.useState("");
    const [errorFirstName, setErrorFirstName] = React.useState("");
    const [errorLastName, setErrorLastName] = React.useState("");
    const sockCtx = useSocket();
    const usr = useUser();

    const onSubmit = () => {
        setErrorUsername("");
        setErrorFirstName("");
        setErrorLastName("");
        if(username === "" || firstName === "" || lastName === "") {
            if (username === "") {
                setErrorUsername("Please fill out the username field");
            }
            if (firstName === "") {
                setErrorFirstName("Please fill out the first name field");
            }
            if (lastName === "") {
                setErrorLastName("Please fill out the last name field");
            }
            return;
        }
        console.log(username, firstName, lastName);
        sockCtx.setupUser(usr.userData!.id, username, firstName, lastName).then((res)=>{
            if(res){
                console.log("User created");
                usr.updateUser(res);
            }else {
                console.log("Error creating user");
            }
        });
    }

    useEffect(() => {
        sockCtx.checkUserNameTaken(username).then((taken)=>{
            if(taken){
                setErrorUsername("Username taken, please try another");
                console.log("Username taken");
                return;
            }else {
                console.log("Username not taken");
            }
        });
    }, [usernameDebounce]);

    const checkUsername = (e) => {
        setErrorUsername("");
        setUsername(e.currentTarget.value)
        if(e.currentTarget.value === ""){
            setErrorUsername("Please fill out the username field");
            return;
        }
    }

    const checkFirstName = (e) => {
        setErrorFirstName("")
        setFirstName(e.currentTarget.value)
        if(e.currentTarget.value === ""){
            setErrorFirstName("Please fill out the first name field");
            return;
        }
    }

    const checkLastName = (e) => {
        setErrorLastName("")
        setLastName(e.currentTarget.value)
        if(e.currentTarget.value === ""){
            setErrorLastName("Please fill out the last name field");
            return;
        }
    }

    return (
        <Container h="100%" fluid maw="100%" p="lg" bg="#1d2022">
            <Center>
                <Paper
                    bg={"#0c0c10"}
                >
                    <Stack
                        px={50}
                        py={30}
                        mih={400}
                        c={"#ebebeb"}
                    >
                        <Stack ta="center">
                            <Title>
                                First Time Setup
                            </Title>
                            <Text>
                                Finish setting up your account to get started
                            </Text>
                        </Stack>
                        
                        <TextInput
                            label="Username"
                            placeholder="Mosaiq"
                            error={errorUsername}
                            value = {username}
                            onChange = {checkUsername}
                            radius="md"
                            size="md"
                        />
                        <TextInput
                            label="First Name"
                            placeholder="Javier"
                            error = {errorFirstName}
                            value = {firstName}
                            onChange = {checkFirstName}
                            radius="md"
                            size="md"
                        />
                        <TextInput
                            label="Last Name"
                            placeholder="Moncada"
                            error = {errorLastName}
                            value = {lastName}
                            onChange = {checkLastName}
                            radius="md"
                            size="md"
                        />

                        <Button
                            variant="gradient"
                            gradient={{ from: 'rgba(8, 42, 115, 1)', to: 'rgba(96, 3, 138, 1)', deg: 270 }}
                            onClick={onSubmit}
                        >Submit</Button>
                        <Space/>
                    </Stack>
                </Paper>
            </Center>
        </Container>
    );
}