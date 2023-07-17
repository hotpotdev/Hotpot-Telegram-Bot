import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type JettonWalletConfig = {
  ownerAddress: Address;
  minterAddress: Address;
  walletCode: Cell;
};

export function jettonWalletConfigToCell(config: JettonWalletConfig): Cell {
  return beginCell()
    .storeCoins(0)
    .storeAddress(config.ownerAddress)
    .storeAddress(config.minterAddress)
    .storeRef(config.walletCode)
    .endCell();
}

export class JettonWallet implements Contract {
  constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) { }

  static createFromAddress(address: Address) {
    return new JettonWallet(address);
  }

  static createFromConfig(config: JettonWalletConfig, code: Cell, workchain = 0) {
    const data = jettonWalletConfigToCell(config);
    const init = { code, data };
    return new JettonWallet(contractAddress(workchain, init), init);
  }

  async buildTransferCell(opts: {
    value: bigint;
    toAddress: Address;
    queryId: number;
    fwdAmount: bigint;
    jettonAmount: bigint;
  }): Promise<Cell> {
    return beginCell()
      .storeUint(0xf8a7ea5, 32)
      .storeUint(opts.queryId, 64)
      .storeCoins(opts.jettonAmount)
      .storeAddress(opts.toAddress)
      .storeAddress(opts.toAddress)
      .storeUint(0, 1)
      .storeCoins(opts.fwdAmount)
      .storeUint(0, 1)
      .endCell()
  }

  async buildBurnCell(opts: {
    toAddress: Address;
    queryId: number
    jettonAmount: bigint;
  }): Promise<Cell> {
    return beginCell()
      .storeUint(0x595f07bc, 32)
      .storeUint(opts.queryId, 64)
      .storeCoins(opts.jettonAmount)
      .storeAddress(opts.toAddress)
      .storeUint(0, 1)
      .endCell()
  }

  async getBalance(provider: ContractProvider): Promise<bigint> {
    const result = await provider.get('get_wallet_data', []);
    return result.stack.readBigNumber();
  }
}
