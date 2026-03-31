import { BigInt } from '@graphprotocol/graph-ts';
import { MarketCreated } from '../generated/ArenaFactory/ArenaFactory';
import { Market, User } from '../generated/schema';
import { ArenaMarket as ArenaMarketTemplate } from '../generated/templates';

export function handleMarketCreated(event: MarketCreated): void {
  let creatorId = event.params.creator.toHexString();
  let user = User.load(creatorId);
  if (user == null) {
    user = new User(creatorId);
    user.totalBets = BigInt.fromI32(0);
    user.totalVolume = BigInt.fromI32(0);
    user.totalWon = BigInt.fromI32(0);
    user.pnl = BigInt.fromI32(0).toBigDecimal();
    user.save();
  }

  let market = new Market(event.params.proxy.toHexString());
  market.marketId = event.params.marketId;
  market.creator = creatorId;
  market.status = 'PENDING_APPROVAL';
  market.totalPool = BigInt.fromI32(0);
  market.createdAt = event.block.timestamp;
  market.save();

  ArenaMarketTemplate.create(event.params.proxy);
}
