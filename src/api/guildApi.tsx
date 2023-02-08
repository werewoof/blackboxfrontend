import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { chatApi } from "./api";
import { Msg } from "./types/msg";
import { Guild } from "./types/guild";
import { User } from "./types/user";
import { number } from "yup";

const guildApi = chatApi.injectEndpoints({
  endpoints: (builder) => ({
    getGuilds: builder.query<Guild[], void>({
      query: () => ({
        url: "/guilds",
        method: "GET",
      }),
    }),
    getGuildMembers: builder.query<User[], number>({
      query: (id) => ({
        url: `/guilds/${id}/members`,
        method: "GET",
      }),
    }),
    getGuildSettings: builder.query<Guild, number>({
      query: (id) => ({
        url: `/guilds/${id}/settings`,
        method: "GET",
      }),
    }),
    getGuildMsgs: builder.query<Msg[], {id : number; time : number}>({
      query: ({id, time}) => ({
        url: `/guilds/${id}/msgs`,
        method: "GET",
        params: {time}
      }),
    }),
    postGuildMsg: builder.query<void, { id: number; msg: Msg }>({
      query: ({ id, msg }) => ({
        url: `/guilds/${id}/messages`,
        method: "POST",
        body: msg,
      }),
    }),
    deleteGuildMsg: builder.query<void, { id: number; msgId: number }>({
      query: ({ id, msgId }) => ({
        url: `/guilds/${id}/messages/${msgId}`,
        method: "DELETE",
      }),
    }),
    patchGuildMsg: builder.query<void, { id: number; msgId: number; msg: Msg }>({
      query: ({ id, msgId, msg }) => ({
        url: `/guilds/${id}/messages/${msgId}`,
        method: "PATCH",
        body: msg,
      }),
    }),
    getGuildBans: builder.query<User[], number>({
      query: (id) => ({
        url: `/guilds/${id}/bans`,
        method: "GET",
      }),
    }),
    getGuildInvites: builder.query<string[], number>({
      query: (id) => ({
        url: `/guilds/${id}/invites`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  getGuilds,
  getGuildMembers,
  getGuildSettings,
  getGuildMsgs,
  postGuildMsg,
  deleteGuildMsg,
  patchGuildMsg,
  getGuildBans,
  getGuildInvites,
} = guildApi.endpoints;

export default guildApi;