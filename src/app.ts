import dotenv from "dotenv";
import { Bot, InlineKeyboard, session } from "grammy";
import { conversations, createConversation } from "@grammyjs/conversations";

import {
  startBurnProcess,
  startMintProcess,
  startQueryProcess,
  startUpdateWalletProcess,
} from "./bot/handlers/payment";
import { startHandler } from "./bot/handlers/start";

dotenv.config();

async function runApp() {
  console.log("Starting app...");

  // Handler of all errors, in order to prevent the bot from stopping
  process.on("uncaughtException", function (exception) {
    console.log(exception);
  });
  // Initialize the bot
  const bot = new Bot(process.env.BOT_TOKEN!);

  // Set the initial data of our session
  bot.use(session({ initial: () => ({ amount: 0, comment: "", wallet:null }) }) as any);
  // Install the conversation plugin
  bot.use(conversations() as any);
  bot.use(createConversation(startQueryProcess));
  bot.use(createConversation(startMintProcess));
  bot.use(createConversation(startBurnProcess));
  bot.use(createConversation(startUpdateWalletProcess));

  // Register all handelrs
  bot.command("start", startHandler);

  bot.callbackQuery("mint", async (ctx: any) => {
    await ctx.conversation.enter("startMintProcess");
  });
  bot.callbackQuery("burn", async (ctx: any) => {
    await ctx.conversation.enter("startBurnProcess");
  });
  bot.callbackQuery("balance", async (ctx: any) => {
    await ctx.conversation.enter("startQueryProcess");
  });
  bot.callbackQuery("setWallet", async (ctx: any) => {
    await ctx.conversation.enter("startUpdateWalletProcess");
  });
  bot.callbackQuery("price", async (ctx: any) => {
    await ctx.conversation.enter("startUpdateWalletProcess");
    // await ctx.conversation.enter("startQueryProcess");
  });

  await bot.api.setMyCommands([
    { command: "start", description: "开始使用 hotpot 👋🤖!" },
    // { command: "mint", description: "铸造 hotpot 📥" },
    // { command: "burn", description: "销毁 hotpot 📤" },
    // { command: "price", description: "当前价格 📈" },
    // { command: "balance", description: "我的余额 💰" },
  ]);;
  // Start bot
  await bot.init();
  bot.start();
  console.info(`Bot @${bot.botInfo.username} is up and running`);
}

void runApp();
