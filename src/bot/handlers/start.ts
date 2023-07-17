import { InlineKeyboard } from "grammy";

export const startHandler = async (ctx) => {
  let msg_id = ctx.session.start_msg_id
  const menu = new InlineKeyboard()
    .text("铸造 hotpot 📥", "mint")
    .text("销毁 hotpot 📤", "burn")
    .row()
    .text("设置钱包 🖊️", "setWallet")
    .text("我的余额 💰", "balance")
    .row()
    .webApp('hotpot 小程序 🎱', "https://app.hotpotdao.xyz/")
    .url("打开 hotpot dapp 🎮", "https://app.hotpotdao.xyz/")
    .row()
    .url("hotpot 文档 📑", "https://docs.hotpotdao.xyz/")
    .row();
  // 先发新的
  let ans = await ctx.replyWithPhoto(
    "https://hotpotdao.xyz/static/images/banner.png",
    {
      reply_markup: menu, parse_mode: "HTML",
      caption:
        `你好 👋👋👋! 欢迎使用 hotpot 🫰, 这是一个 hotpot 协议测试机器人🤖, 实现了 token 代币的铸造与购买`,
    }
  );
  // 再删老的
  if (msg_id) {
    await ctx.api.deleteMessage(ctx.chat?.id, msg_id);
  }
  msg_id = ans.message_id
  ctx.session.start_msg_id = msg_id
}
