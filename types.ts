
export interface AlphaReward {
  id: string;
  tokenName: string;
  quantity: number;
  value: number;
}

export interface TradeEvent {
  id: string;
  tokenName: string;
  totalVolume: number;
  totalTradeFee: number;
  rewardQuantity: number;
  value: number;
}

export interface User {
  id: string;
  name: string;
  alphaRewards: AlphaReward[];
  tradeEvents: TradeEvent[];
}
