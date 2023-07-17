import { Bot, Context, InlineKeyboard } from "grammy";
import { Provider } from "../../services/ton";
import { Address, fromNano } from "ton-core";
import { TokenAgent } from "../../services/token";

const tokenAddr = Address.parse("EQBB3SZrbtyWuX7-vuY-PGfzpMNx3gPRII3UdfHPeA-TCrDU");

export async function startMintProcess(conversation, ctx) {
  // Remove the loading clock
  await ctx.answerCallbackQuery("铸造");
  const network = "testnet"
  const provider = new Provider(network)
  const token = new TokenAgent(provider, tokenAddr)
  let walletAddr = conversation.session.wallet
  if (!walletAddr) {
    await startUpdateWalletProcess(conversation, ctx)
    walletAddr = conversation.session.wallet
  }
  const wallet = Address.parse(conversation.session.wallet)

  await ctx.reply("请输入铸造数量");
  const num = Number(await conversation.form.number());

  // Generate links for a quick transition to the wallet application. WARNING: works only on mainnet
  const tonhubPaymentLink = await token.getLinkForMint("tonhub", wallet, num, 0.05,);
  const tonkeeperPaymentLink = await token.getLinkForMint("tonkeeper", wallet, num, 0.05,);
  const tonwalletPaymentLink = await token.getLinkForMint("tonwallet", wallet, num, 0.05,);

  const menu = new InlineKeyboard()
    .url("TonHub", tonhubPaymentLink)
    .url("TonKeeper", tonkeeperPaymentLink)
    .url("TonWallet", tonwalletPaymentLink)
    .row();



  await ctx.reply(`铸造 ${num} 枚代币需要 0.05 TON,请在钱包中完成交易`, {
    reply_markup: menu,
  });
}

export async function startBurnProcess(conversation, ctx) {
  // Remove the loading clock
  await ctx.answerCallbackQuery("销毁");
  const network = "testnet"
  const provider = new Provider(network)
  const token = new TokenAgent(provider, tokenAddr)

  let walletAddr = conversation.session.wallet
  if (!walletAddr) {
    await startUpdateWalletProcess(conversation, ctx)
    walletAddr = conversation.session.wallet
  }
  const wallet = Address.parse(conversation.session.wallet)

  await ctx.reply("请输入销毁数量");
  const num = Number(await conversation.form.number());

  const tonhubPaymentLink = await token.getLinkForBurn("tonhub", wallet, num);
  const tonkeeperPaymentLink = await token.getLinkForBurn("tonkeeper", wallet, num);
  const tonwalletPaymentLink = await token.getLinkForBurn("tonwallet", wallet, num);

  const menu = new InlineKeyboard()
    .url("TonHub", tonhubPaymentLink)
    .url("TonKeeper", tonkeeperPaymentLink)
    .url("TonWallet", tonwalletPaymentLink)
    .row();

  await ctx.reply("请在钱包中完成交易", {
    reply_markup: menu,
  });
}

export async function startQueryProcess(conversation, ctx) {
  // Remove the loading clock
  await ctx.answerCallbackQuery("余额查询");
  const network = "testnet"
  const provider = new Provider(network)
  const token = new TokenAgent(provider, tokenAddr)
  let walletAddr = conversation.session.wallet
  if (!walletAddr) {
    await startUpdateWalletProcess(conversation, ctx)
    walletAddr = conversation.session.wallet
  }
  const wallet = Address.parse(conversation.session.wallet)
  const balance = await token.getBalance(wallet)
  await ctx.reply(`您的钱包为 ${walletAddr} \n余额为 ${fromNano(balance)}`);
}


export async function startUpdateWalletProcess(conversation, ctx) {
  await ctx.reply("请输入您的钱包地址");
  const wallet = await conversation.form.text();
  if (conversation.session) conversation.session.wallet = wallet;
  else conversation.session = { wallet };
  await ctx.reply(`已将您的钱包设为 ${wallet}`)
}
