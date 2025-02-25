import React from "react";
import { Outlet, NavLink } from "react-router"
import { useDisclosure, useHotkeys, useWindowScroll } from "@mantine/hooks";
import { AppShell, Burger, Flex, Group, Tooltip, ActionIcon, Kbd, Divider, Input, Text } from "@mantine/core";

import { MdOutlineAccountCircle, MdOutlineSearch } from 'react-icons/md';
import { IconLayoutKanban, IconHome } from '@tabler/icons-react';

import TRZModalSearch from "@trz/components/TRZModalSearch";
import '@trz/styles/AvatarButton.css'
import '@trz/styles/Header.css'
import '@trz/styles/Focus.css'

const TRZAppLayout = () => {
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(false);
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [modalOpened, { close: closeModal, open: openModal }] = useDisclosure(false);
  const [scroll, scrollTo] = useWindowScroll();
  const pinned = scroll.y < 150;

  useHotkeys([
    ['ctrl+k', () => openModal()],
    ['[', () => toggleDesktop()],
  ])

  return (
    <AppShell
      withBorder={false}
      transitionDuration={200}
      header={{
        height: "calc(3.5rem * var(--mantine-scale))"
      }}
      navbar={{
        width: (desktopOpened) ? "255px" : "55px",
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened },
      }}
    >
      <AppShell.Header
        mod={{ pinned: !pinned, sidebar: desktopOpened }}>
        <header
          className="trzNavigationMenuRoot">
          <ul className="trzNavigationMenuList">
            <Tooltip
              color={"var(--mantine-color-gray-7)"}
              offset={{ mainAxis: 5 }}
              label={
                <Group gap={"calc(0.5rem * var(--mantine-scale))"} align={"center"}>
                  <Text size={"sm"}>Collapse Sidebar</Text>
                  <Kbd>[</Kbd>
                </Group>
              }>
              <Burger
                transitionDuration={200}
                opened={desktopOpened}
                onClick={toggleDesktop}
                size="sm" />
            </Tooltip>
            <li className="trzNavigationMenuItem">
              <NavLink className="trz-NavLink trz-Focus" to={"/"}>Terrazzo</NavLink>
            </li>
          </ul>
          <ul className="trzNavigationMenuList">
            <li className="trzNavigationMenuItem">
              <Input
                mod={{ pinned: !pinned }}
                pointer
                component={"button"}
                onClick={openModal}>
                <Group gap={"calc(0.5rem * var(--mantine-scale))"} align={"center"}>
                  <MdOutlineSearch />
                  <Text size={"md"} style={{ paddingRight: "2rem" }}>Search all</Text>
                  <Text size={"xs"} className={"key-binding"}>Ctrl + K</Text>
                </Group>
              </Input>
            </li>
            <li className="trzNavigationMenuItem">
              <Tooltip
                color={"var(--mantine-color-gray-7)"}
                offset={{ mainAxis: 5 }}
                label={
                  <Text size={"sm"}>Account</Text>
                }>
                <ActionIcon
                  size={"input-sm"}
                  variant={"default"}
                  className={"trz-Avatar"}
                  aria-label={"Login to Account Button"}>
                  <NavLink to={"/login"}>
                    <MdOutlineAccountCircle size={"1.5rem"} />
                  </NavLink>
                </ActionIcon>
              </Tooltip>
            </li>
          </ul>
        </header>
      </AppShell.Header>

      <AppShell.Navbar
        mod={{ pinned: !pinned, sidebar: desktopOpened }}>
        <Flex style={{ marginTop: "1rem" }} direction={"column"}>
          <NavLink className="trz-Navbar-NavLink trz-Focus" to={"/"}>
            <Group
              className="trz-Navbar-Group"
              gap={"calc(1.5rem * var(--mantine-scale))"}
              align={"center"}>
              <IconLayoutKanban stroke={"0.109rem"}/>
              <Text className={"trz-Navbar-NavLink-text"} size={"md"}>
                {(desktopOpened) ? "Boards" : "" }
              </Text>
            </Group>
          </NavLink>
          <NavLink className="trz-Navbar-NavLink trz-Focus" to={"/"}>
            <Group
              className="trz-Navbar-Group"
              gap={"calc(1.5rem * var(--mantine-scale))"}
              align={"center"}>
              <IconHome stroke={"0.109rem"} />
              <Text className={"trz-Navbar-NavLink-text"} size={"md"}>
                {(desktopOpened) ? "Home" : "" }
              </Text>
            </Group>
          </NavLink>
        </Flex>
      </AppShell.Navbar>

      <AppShell.Main>
        <TRZModalSearch
          opened={modalOpened}
          onClose={closeModal}
        />
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};

export default TRZAppLayout;
