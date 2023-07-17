import { exit } from "process";
import { Address, Cell, HttpApi, TonClient, fromNano, toNano } from "ton";

export class Provider {
  private net: "mainnet" | "testnet"
  private httpapi?: HttpApi
  private tonclient?: TonClient
  constructor(network: "mainnet" | "testnet") {
    this.net = network
  }
  private endpoint() {
    return this.net === "mainnet"
      ? "https://toncenter.com/api/v2/jsonRPC"
      : "https://testnet.toncenter.com/api/v2/jsonRPC";

  }

  network() {
    return this.net
  }

  getHttpClient() {
    if (!this.httpapi) {
      const apiKey = process.env.TONCENTER_TOKEN!
      this.httpapi = new HttpApi(
        this.endpoint(),
        { apiKey }
      );
      return this.httpapi!
    } else return this.httpapi
  }

  getTonClient() {
    if (!this.tonclient) {
      const apiKey = process.env.TONCENTER_TOKEN!
      this.tonclient = new TonClient({
        endpoint: this.endpoint(),
        timeout: 5000,
        apiKey
      });
      return this.tonclient!
    } else return this.tonclient
  }

  genDeepLink(info: {
    app: "tonhub" | "tonkeeper" | "tonwallet",
    to: Address,
    value?: bigint,
    bin?: Cell,
    comment?: string
  }
  ) {
    let msg = ""
    if (info.app === "tonhub") {
      msg = `https://tonhub.com/transfer/${info.to}?`
    } else if (info.app === "tonkeeper") {
      msg = `https://app.tonkeeper.com/transfer/${info.to}?`
    } else {
      msg = `ton://transfer/${info.to}?`
    }
    if (info.value) msg += `amount=${info.value}`
    if (info.bin) msg += `&bin=${info.bin.toBoc().toString('base64url')}`
    if (info.comment) msg += `&text=${info.comment}`
    return msg;
  }

}
