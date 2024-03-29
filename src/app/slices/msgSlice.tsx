import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AttachmentUpload, Msg } from "../../api/types/msg";
import {
  createGuildMsg,
  getGuildMsgs,
  retryGuildMsg,
} from "../../api/guildApi";
import { Guild } from "../../api/types/guild";

type MsgState = {
  msgs: Record<string, Msg>; //figure out how to dynamically update user pfp for msgs later - can't be bothered do it rn
  author: Record<string, string[]>;
  loadingAttachments: Record<string, AttachmentUpload[]>; //temp id : attachments
  guildMsgIds: Record<string, string[]>; //order newest to oldest
};

const initialState: MsgState = {
  // guildMsgIds also include dms because they are basically the same
  msgs: {},
  author: {},
  loadingAttachments: {},
  guildMsgIds: {},
};

const msgSlice = createSlice({
  name: "msg",
  initialState,
  reducers: {
    addGuildMsg: (
      state,
      action: PayloadAction<{ guildId: string; msg: Msg }>
    ) => {
      //TODO: author isnt normalized so normalize later on
      const { guildId, msg } = action.payload;
      state.msgs[msg.id] = msg;
      if (state.guildMsgIds[guildId] === undefined) {
        state.guildMsgIds[guildId] = [];
      }
      if (!msg?.loading) {
        if (state.author[msg.author.id] === undefined) {
          state.author[msg.author.id] = [];
        }
        state.author[msg.author.id].unshift(msg.id);
      }
      state.guildMsgIds[guildId].unshift(msg.id);
    },
    editMsg: (state, action: PayloadAction<Msg>) => {
      const msg = action.payload;
      if (state.msgs[msg.id] === undefined) {
        return;
      }
      state.msgs[msg.id].content = msg.content;
      state.msgs[msg.id].mentions = msg.mentions;
      state.msgs[msg.id].mentionsEveryone = msg.mentionsEveryone;
    },
    removeGuildMsg: (state, action: PayloadAction<Msg>) => {
      const msg = action.payload;
      if (state.guildMsgIds[msg.guildId] === undefined) {
        return;
      }
      state.guildMsgIds[msg.guildId] = state.guildMsgIds[msg.guildId].filter(
        (id) => id !== msg.id
      );
      delete state.msgs[msg.id];
      if (!msg?.failed) {
        if (state.author[msg.author.id] === undefined) {
          return;
        }
        state.author[msg.author.id] = state.author[msg.author.id].filter(
          (id) => id !== msg.id
        );
      }
    },
    removeAllGuildMsg: (state, action: PayloadAction<Guild>) => {
      const { id } = action.payload;
      if (state.guildMsgIds[id] === undefined) {
        return;
      }
      for (const msgId of state.guildMsgIds[id]) {
        delete state.msgs[msgId];
      }
      delete state.guildMsgIds[id];
    },
    removeAuthorMsg: (state, action: PayloadAction<Msg>) => {
      const msg = action.payload;
      if (state.author[msg.author.id] === undefined) {
        return;
      }
      for (const msgId of state.author[msg.author.id]) {
        delete state.msgs[msgId];
      }
      delete state.author[msg.author.id];
    },
    resetMsgs: (state) => {
      state.msgs = {};
      state.author = {};
      state.guildMsgIds = {};
    },
  },
  extraReducers: (builder) => {
    //do get guilds fulfilled later to replace undefined later
    builder.addCase(
      getGuildMsgs.fulfilled,
      (state, action: PayloadAction<Msg[]>) => {
        for (const msg of action.payload) {
          state.msgs[msg.id] = msg;
          if (state.author[msg.author.id] === undefined) {
            //if not exist
            state.author[msg.author.id] = [];
          }
          if (state.guildMsgIds[msg.guildId] === undefined) {
            state.guildMsgIds[msg.guildId] = [];
          }
          state.author[msg.author.id].push(msg.id);
          state.guildMsgIds[msg.guildId].push(msg.id);
        }
      }
    );
    builder.addCase(createGuildMsg.pending, (state, action) => {
      const loadingMsgId = `loading-${action.meta.requestId}`;
      const guildId = action.meta.arg.id;
      var loadingMsg = {
        id: loadingMsgId,
        content: action.meta.arg.msg.content,
        loading: true,
        guildId: guildId,
        uploadIds: action.meta.arg.msg.uploadIds,
      } as Msg;
      state.msgs[loadingMsgId] = loadingMsg;
      if (state.guildMsgIds[guildId] === undefined) {
        state.guildMsgIds[guildId] = [];
      }
      state.guildMsgIds[guildId].unshift(loadingMsgId);
    });
    builder.addCase(createGuildMsg.fulfilled, (state, action) => {
      const loadingMsgId = `loading-${action.meta.requestId}`;
      const guildId = action.meta.arg.id;
      state.guildMsgIds[guildId] = state.guildMsgIds[guildId].filter(
        (id) => id !== loadingMsgId
      );
      delete state.msgs[loadingMsgId];
    });
    builder.addCase(createGuildMsg.rejected, (state, action) => {
      const loadingMsgId = `loading-${action.meta.requestId}`;
      const guildId = action.meta.arg.id;

      state.guildMsgIds[guildId] = state.guildMsgIds[guildId].filter(
        (id) => id !== loadingMsgId
      );
      delete state.msgs[loadingMsgId];

      //TODO: revamp to status codes in backend to use status codes instead.
      if (
        action.payload?.error ===
        "msg: recipient is blocked or has blocked user"
      ) {
        return;
      }

      const errorMsgId = `error-${action.meta.requestId}`;
      var failedMsg = Object.assign({}, action.meta.arg.msg);
      failedMsg.id = errorMsgId;
      failedMsg.guildId = guildId;
      failedMsg.failed = true;
      state.msgs[errorMsgId] = failedMsg;
      state.guildMsgIds[guildId].unshift(errorMsgId);
    });
    builder.addCase(retryGuildMsg.fulfilled, (state, action) => {
      const failedMsgId = action.meta.arg.msgId;
      delete state.msgs[failedMsgId];
      const guildId = action.meta.arg.id;
      state.guildMsgIds[guildId] = state.guildMsgIds[guildId].filter(
        (id) => id !== failedMsgId
      );
    });
  },
});

export default msgSlice.reducer;

export const {
  addGuildMsg,
  editMsg,
  removeGuildMsg,
  removeAllGuildMsg,
  removeAuthorMsg,
  resetMsgs,
} = msgSlice.actions;
