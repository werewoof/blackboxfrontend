import { Dm } from "./dm";
import { UnreadMsg } from "./msg";
import { User } from "./user";

export interface Guild {
  id: string;
  name: string;
  imageId: string;
  unread: UnreadMsg;
  saveChat: boolean;
  ownerId: string;
}

export interface Invite {
  guildId: string;
  invite: string;
}

export interface GuildList {
  guilds: Guild[];
  dms: Dm[];
}

export interface GuildUpload {
  body: Guild;
  image: File | null;
}

export interface Typing {
  guildId: string;
  userInfo: User;
  Time: string;
}
