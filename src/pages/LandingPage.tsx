import React from "react";
import {
  Box,
  Flex,
  Group,
  Button,
  Divider,
  Title,
  Text,
  Image,
  Stack,
  Center,
  Container,
  Anchor,
} from "@mantine/core";
import { Link } from "react-router-dom";

import "./LandingPage.css";
import TerrazzoLogo from "../assets/terrazzo-logo.svg";
import mosaiqLogo from "../assets/mosaiq-logo.png";
import terrazzoScreenshot from "../assets/terrazzo-screenshot.png";

const COLORS = {
  background: "#19191b",
  divider: "#2c2c2d",
  primary: "#fafafa",
  secondary: "#918e8e",
};
// -----------------------------------

const MAX_WIDTH = 700;

const LandingPage = () => (
  <Box bg={COLORS.background} style={{overflow: "scroll", height: "100vh"}}>
    {/* Navbar */}
    <Box
      component="nav"
      bg={COLORS.background}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        borderBottom: `1px solid ${COLORS.divider}`,
      }}
    >
      <Container size={MAX_WIDTH} py="md">
        <Flex justify="space-between" align="center">
          <Group gap="sm">
            <TerrazzoLogo style={{ fill: COLORS.primary, width: 36, height: 36 }} />
            <Title order={3} c={COLORS.primary} fw={700} style={{ letterSpacing: 1 }}>
              terrazzo
            </Title>
          </Group>
          <Group gap="xs">
            <Button
              component={Link}
              to="/login"
              color={COLORS.primary}
              c={COLORS.background}
              variant="filled"
              radius="md"
            >
              Sign up
            </Button>
            <Anchor
              component={Link}
              to="/login"
              c={COLORS.primary}
              underline="always"
              fw={500}
              style={{ fontSize: 16 }}
            >
              Log in
            </Anchor>
          </Group>
        </Flex>
      </Container>
    </Box>

    <Divider size={1} color={COLORS.divider} />

    {/* Hero Section */}

    <Stack align="center" py={60}>
      <Stack align="center" gap="xs" w="100%" maw={MAX_WIDTH}>
        <Title
          order={1}
          ta="center"
          fw={900}
          c={COLORS.primary}
          style={{ fontSize: 40, lineHeight: 1.1 }}
        >
          Project management <br/> Without restrictions
        </Title>
        <Text ta="center" c={COLORS.secondary} fz="lg" mb="md">
          Create stories, assign tasks, and ship features fast with your whole team.
        </Text>
        <Group gap="sm" mt="md">
          <Button
            component={Link}
            to="/login"
            color={COLORS.primary}
            c={COLORS.background}
            size="md"
            radius="md"
            fw={600}
          >
            Get started
          </Button>
          <Anchor
            component={Link}
            to="/login"
            c={COLORS.primary}
            underline="always"
            fw={500}
            style={{ fontSize: 16, alignSelf: "center" }}
          >
            Already using Terrazzo?
          </Anchor>
        </Group>
      </Stack>
      <div id="features">
        <div id="before">
          <div className="feature">
            <Text c={COLORS.secondary} fz="sm">
              Easily sort tasks into columns
            </Text>
            <div className="connector"></div>
            <div className="node"></div>
          </div>
          <div className="feature">
            <Text c={COLORS.secondary} fz="sm">
              Easily manage multiple workspaces
            </Text>
            <div className="connector"></div>
            <div className="node"></div>
          </div>
        </div>
        <img
          src={terrazzoScreenshot}
          alt="App screenshot"
        />
        <div id="after">
          <div className="feature">
            <div className="node"></div>
            <div className="connector"></div>
            <Text c={COLORS.secondary} fz="sm">
              Track progress using size and status
            </Text>
          </div>
          <div className="feature">
            <div className="node"></div>
            <div className="connector"></div>
            <Text c={COLORS.secondary} fz="sm">
              Add context with labels and descriptions
            </Text>
          </div>
        </div>
      </div>
      <Stack align="center" gap="xs" w="100%" maw={MAX_WIDTH}>
        <Stack align="center" gap={0} mt={10}>
          <Text c={COLORS.secondary} fz="sm">
            Proudly created and used by
          </Text>
          <Group gap={5} mt={4}>
            <img
              src={mosaiqLogo}
              alt="Mosaiq Software logo"
              width={32}
              height={32}
            />
            <Text fw={700} c={COLORS.primary}>
              Mosaiq Software
            </Text>
          </Group>
          <Anchor
            href="https://mosaiq.dev"
            target="_blank"
            rel="noopener noreferrer"
            c={COLORS.primary}
            underline="always"
            fw={500}
            style={{ fontSize: 15 }}
          >
            Learn more
          </Anchor>
        </Stack>
      </Stack>
    </Stack>

    <Divider size={1} color={COLORS.divider} />

    {/* Footer */}
    <Box bg={COLORS.background} py="md">
      <Center>
        <Text c={COLORS.secondary} fz="sm">
          © Mosaiq Software, 2025
        </Text>
      </Center>
    </Box>
  </Box>
);

export default LandingPage;