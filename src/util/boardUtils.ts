export const CARD_CACHE_PREFIX = "CARD_CACHE:";
export const LIST_CACHE_PREFIX = "LIST_CACHE:";

export const getCardNumber = (boardCode: string, cardNumber:number)=> {
    return boardCode ? (`${boardCode}-${cardNumber}`) : `# ${cardNumber}`;
}