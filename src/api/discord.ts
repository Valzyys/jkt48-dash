import { logout } from '@/utils/auth/hooks';
import { callReturn } from '@/utils/fetch/core';
import { discordRequest } from '@/utils/fetch/requests';
import { useEffect } from 'react';
import { Pool } from 'pg';

export type UserInfo = {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  mfa_enabled?: boolean;
  banner?: string;
  accent_color?: number;
  locale?: string;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
};

export type Guild = {
  id: string;
  name: string;
  icon: string;
  permissions: string;
};

export type IconHash = string;

export enum PermissionFlags {
  CREATE_INSTANT_INVITE = 1 << 0,
  KICK_MEMBERS = 1 << 1,
  BAN_MEMBERS = 1 << 2,
  ADMINISTRATOR = 1 << 3,
  MANAGE_CHANNELS = 1 << 4,
  MANAGE_GUILD = 1 << 5,
  ADD_REACTIONS = 1 << 6,
  VIEW_AUDIT_LOG = 1 << 7,
  PRIORITY_SPEAKER = 1 << 8,
  STREAM = 1 << 9,
  VIEW_CHANNEL = 1 << 10,
  SEND_MESSAGES = 1 << 11,
  SEND_TTS_MESSAGES = 1 << 12,
  MANAGE_MESSAGES = 1 << 13,
  EMBED_LINKS = 1 << 14,
  ATTACH_FILES = 1 << 15,
  READ_MESSAGE_HISTORY = 1 << 16,
  MENTION_EVERYONE = 1 << 17,
  USE_EXTERNAL_EMOJIS = 1 << 18,
  VIEW_GUILD_INSIGHTS = 1 << 19,
  CONNECT = 1 << 20,
  SPEAK = 1 << 21,
  MUTE_MEMBERS = 1 << 22,
  DEAFEN_MEMBERS = 1 << 23,
  MOVE_MEMBERS = 1 << 24,
  USE_VAD = 1 << 25,
  CHANGE_NICKNAME = 1 << 26,
  MANAGE_NICKNAMES = 1 << 27,
  MANAGE_ROLES = 1 << 28,
  MANAGE_WEBHOOKS = 1 << 29,
  MANAGE_EMOJIS_AND_STICKERS = 1 << 30,
  USE_APPLICATION_COMMANDS = 1 << 31,
  REQUEST_TO_SPEAK = 1 << 32,
  MANAGE_EVENTS = 1 << 33,
  MANAGE_THREADS = 1 << 34,
  CREATE_PUBLIC_THREADS = 1 << 35,
  CREATE_PRIVATE_THREADS = 1 << 36,
  USE_EXTERNAL_STICKERS = 1 << 37,
  SEND_MESSAGES_IN_THREADS = 1 << 38,
  USE_EMBEDDED_ACTIVITIES = 1 << 39,
  MODERATE_MEMBERS = 1 << 40,
}

export enum ChannelTypes {
  GUILD_TEXT = 0,
  DM = 1,
  GUILD_VOICE = 2,
  GROUP_DM = 3,
  GUILD_CATEGORY = 4,
  GUILD_ANNOUNCEMENT = 5,
  ANNOUNCEMENT_THREAD = 10,
  PUBLIC_THREAD = 11,
  PRIVATE_THREAD = 12,
  GUILD_STAGE_VOICE = 13,
  GUILD_DIRECTORY = 14,
  GUILD_FORUM = 15,
}

// Pool configuration for CockroachDB
const pool = new Pool({
  connectionString:
    'postgresql://user_dashboard:kup453nr2R9u3Jh_1wp-JA@jkt48connect-7018.j77.aws-ap-southeast-1.cockroachlabs.cloud:26257/dashboard?sslmode=verify-full',
});

export async function saveUserInfoToDatabase(userInfo: UserInfo, apiKey: string) {
  const client = await pool.connect();
  try {
    const query = `
      INSERT INTO users (id, username, discriminator, avatar, apikey)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO UPDATE 
      SET username = EXCLUDED.username, 
          discriminator = EXCLUDED.discriminator, 
          avatar = EXCLUDED.avatar, 
          apikey = EXCLUDED.apikey;
    `;
    await client.query(query, [
      userInfo.id,
      userInfo.username,
      userInfo.discriminator,
      userInfo.avatar,
      apiKey,
    ]);
  } catch (err) {
    console.error('Error saving user to database:', err);
  } finally {
    client.release();
  }
}

export async function fetchUserInfo(accessToken: string) {
  const userInfo = await callReturn<UserInfo>(
    `/users/@me`,
    discordRequest(accessToken, {
      request: {
        method: 'GET',
      },
      allowed: {
        401: async () => {
          await logout();

          throw new Error('Not logged in');
        },
      },
    })
  );

  // Initialize API Key
  const apiKey = await initializeApiKeyInClient();

  // Save user info and API key to the database
  await saveUserInfoToDatabase(userInfo, apiKey);

  return userInfo;
}

// Function to generate or fetch the API key
async function initializeApiKeyInClient(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined') {
      const existingKey = localStorage.getItem('jkt48-api-key');

      if (!existingKey) {
        fetch('/api/auth/get-api-key')
          .then((res) => res.json())
          .then((data) => {
            if (data.apiKey) {
              localStorage.setItem('jkt48-api-key', data.apiKey);
              console.log('API Key saved to localStorage:', data.apiKey);
              resolve(data.apiKey);
            } else {
              reject(new Error('API key generation failed'));
            }
          })
          .catch((err) => {
            console.error('Failed to fetch API key:', err);
            reject(err);
          });
      } else {
        console.log('API Key already exists in localStorage:', existingKey);
        resolve(existingKey);
      }
    } else {
      reject(new Error('window is undefined'));
    }
  });
}

export async function getGuilds(accessToken: string) {
  return await callReturn<Guild[]>(
    `/users/@me/guilds`,
    discordRequest(accessToken, { request: { method: 'GET' } })
  );
}

export async function getGuild(accessToken: string, id: string) {
  return await callReturn<Guild>(
    `/guilds/${id}`,
    discordRequest(accessToken, { request: { method: 'GET' } })
  );
}

export function iconUrl(guild: Guild) {
  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`;
}

export function avatarUrl(user: UserInfo) {
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}?size=512`;
}

export function bannerUrl(id: string, banner: string): string {
  return `https://cdn.discordapp.com/banners/${id}/${banner}?size=1024`;
}
