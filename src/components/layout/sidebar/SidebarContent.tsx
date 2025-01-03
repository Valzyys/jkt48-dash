import {
  Avatar,
  Box,
  Card,
  CardBody,
  Flex,
  Heading,
  HStack,
  IconButton,
  Spacer,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useActiveSidebarItem, SidebarItemInfo } from '@/utils/router';
import { useGuilds, useSelfUserQuery } from '@/api/hooks';
import { SearchBar } from '@/components/forms/SearchBar';
import { useMemo, useState } from 'react';
import { config } from '@/config/common';
import { FiSettings as SettingsIcon } from 'react-icons/fi';
import { avatarUrl } from '@/api/discord';
import { GuildItem, GuildItemsSkeleton } from './GuildItem';
import Link from 'next/link';
import { SidebarItem } from './SidebarItem';
import items from '@/config/sidebar-items';

export function SidebarContent() {
  const [filter, setFilter] = useState('');
  const guilds = useGuilds();

  const filteredGuilds = useMemo(
    () =>
      guilds.data?.filter((guild) => {
        const contains = guild.name.toLowerCase().includes(filter.toLowerCase());

        return config.guild.filter(guild) && contains;
      }),
    [guilds.data, filter]
  );

  return (
    <>
      <VStack align="center" py="2rem" m={3} bg="Brand" rounded="xl">
        <Heading size="lg" fontWeight={600} color="white">
          {config.name}
        </Heading>
      </VStack>

      <Stack direction="column" mb="auto">
        <Items />
        <Box px="10px">
          <SearchBar
            w="full"
            input={{
              value: filter,
              onChange: (e) => setFilter(e.target.value),
            }}
          />
        </Box>
        <Flex direction="column" px="10px" gap={3}>
          {filteredGuilds == null ? (
            <GuildItemsSkeleton />
          ) : (
            filteredGuilds?.map((guild) => (
              <GuildItem
                key={guild.id}
                guild={guild}
                active={false} // Tidak ada state aktif karena sekarang mengarahkan ke URL invite
                href={`${config.inviteUrl}&guild_id=${guild.id}`} // URL invite bot
                isExternal // Tambahkan ini agar "a" menggunakan target=_blank
              />
            ))
          )}
        </Flex>
      </Stack>

      {/* Menu Baru: Official Website JKT48Connect */}
      <Box mt="5" px="10px">
        <Card as="a" href="https://www.jkt48connect.my.id" target="_blank" rounded="md" bg="teal.500" p={4}>
          <Flex align="center" gap={3}>
            <Avatar size="sm" bg="white" name="JKT48Connect" />
            <Text fontWeight="bold" color="white">
              Official Website JKT48Connect
            </Text>
          </Flex>
        </Card>
      </Box>
    </>
  );
}

export function BottomCard() {
  const user = useSelfUserQuery().data;
  if (user == null) return <></>;

  return (
    <Card pos="sticky" left={0} bottom={0} w="full" py={2}>
      <CardBody as={HStack}>
        <Avatar src={avatarUrl(user)} name={user.username} size="sm" />
        <Text fontWeight="600">{user.username}</Text>
        <Spacer />
        <Link href="/user/profile">
          <IconButton icon={<SettingsIcon />} aria-label="settings" />
        </Link>
      </CardBody>
    </Card>
  );
}

function Items() {
  const active = useActiveSidebarItem();

  return (
    <Flex direction="column" px="10px" gap={0}>
      {items
        .filter((item) => !item.hidden)
        .map((route: SidebarItemInfo, index: number) => (
          <SidebarItem
            key={index}
            href={route.path}
            name={route.name}
            icon={route.icon}
            active={active === route}
          />
        ))}
    </Flex>
  );
}
