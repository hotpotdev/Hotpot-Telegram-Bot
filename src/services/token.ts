
import { Address, HttpApi, TonClient, fromNano, toNano } from "ton";
import { JettonMinter } from "../wrappers/JettonMinter";
import { Provider } from "./ton";
import { JettonWallet } from "../wrappers/JettonWallet";

export class TokenAgent {
  provider: Provider
  address: Address
  private walletAddr?: Address
  constructor(provider: Provider, address: Address | string) {
    this.provider = provider
    if (typeof address === "string") this.address = Address.parse(address)
    else this.address = address
  }
  async getTotalSupply(address:Address) {
    const ton = this.provider.getTonClient()
    const jettonMinter = ton.open(JettonMinter.createFromAddress(this.address))
    return await jettonMinter.getTotalsupply()
  }

  async getWalletAddress(address:Address) {
    if(this.walletAddr) {
      return this.walletAddr
    } else {
      const ton = this.provider.getTonClient()
      const jettonMinter = ton.open(JettonMinter.createFromAddress(this.address))
      this.walletAddr = await jettonMinter.getWalletAddress(address)
      return this.walletAddr
    }
  }

  async getLinkForMint(app: "tonhub" | "tonkeeper" | "tonwallet", toAddress: Address, amount: number, value: number) {
    const ton = this.provider.getTonClient()
    const jettonMinter = ton.open(JettonMinter.createFromAddress(this.address))
    // jettonMinter.sendMint()
    let amt = "" + amount
    let val = "" + value
    let body = await jettonMinter.buildMintCell({
      amount: toNano(val),
      jettonAmount: toNano(amt),
      toAddress,
      queryId: Date.now()
    })
    return this.provider.genDeepLink({
      app,
      to:this.address,
      value: toNano(val),
      bin:body
    })
  }

  async getLinkForBurn(app: "tonhub" | "tonkeeper" | "tonwallet", toAddress: Address, amount: number) {
    const ton = this.provider.getTonClient()
    const jettonWallet = ton.open(JettonWallet.createFromAddress(await this.getWalletAddress(toAddress)))
    let amt = "" + amount
    let body = await jettonWallet.buildBurnCell({
      jettonAmount: toNano(amt),
      toAddress,
      queryId: Date.now()
    })
    return this.provider.genDeepLink({
      app,
      to:await this.getWalletAddress(toAddress),
      value: toNano('0.05'),
      bin:body
    })
  }

  async getBalance(wallet: Address) {
    const ton = this.provider.getTonClient()
    const jettonWallet = ton.open(JettonWallet.createFromAddress(await this.getWalletAddress(wallet)))
    return await jettonWallet.getBalance()
  }
}
