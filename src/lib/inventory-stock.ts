import {cairoDate} from './scheduling-rules';

/** Inventory forms record calendar expiry dates, valid through that Cairo day. */
export function isStockLotExpired(expiryDate:Date|string,now=new Date()){
 const expiry=new Date(expiryDate);
 return Number.isNaN(+expiry)||expiry.toISOString().slice(0,10)<cairoDate(now);
}
