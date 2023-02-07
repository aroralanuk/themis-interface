export interface Project {
  id: string;
  projectId: BigInt;
  name: string;
  description: string;
  artistName: string;
  invocations: BigInt;
  maxInvocations: BigInt;
  activatedAt: BigInt;
  scriptJSON: string;
  active: boolean;
  paused: boolean;
  complete: boolean;
  tokens: Token[];
  pricePerTokenInWei: BigInt;
  currencyAddress: string;
  currencySymbol: string;
  minterConfiguration?: MinterConfiguration;
}

export interface Collection {
  id: string;
}

export interface Account {
  id: string;
}
export interface Token {
  id: string;
  tokenId: string;
  invocation: BigInt;
  uri: string;
  createdAt: BigInt;
  owner?: Account;
}

export interface Bid {
  id: string;
  amount: BigInt;
  createdAt: BigInt;
  position: BigInt;
  bidder: Account;
}

export interface MinterConfiguration {
  basePrice: BigInt;
  startPrice: BigInt;
  priceIsconfigured: boolean;
  currencySymbol: string;
  currencyAddress: string,
  startTime: BigInt,
  endTime: BigInt;
}

export interface Trait {
  trait_type: string;
  value: string;
}

export interface ERC20Token {
  address: string;
  decimals: number;
  symbol: string;
}

export enum OrderDirection {
  ASC = 'asc',
  DESC = 'desc',
}
