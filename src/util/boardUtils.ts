import {List, Card, CardId, CardHeader, ListId} from "@mosaiq/terrazzo-common/types";

export const getCard = (cardId: CardId | null, inLists?: List[]): Card | null => {
    if(!inLists || !cardId){
        return null;
    }
    let card: CardHeader | null = null;
    inLists.forEach(l=>{
        l.cards.forEach(c=>{
            if(c.id === cardId)
                card = c;
        })
    })
    return card;
}

export const getList = (listId: ListId, fromLists?: List[]): List | null => {
    return fromLists?.find(l=>l.id === listId) ?? null;
}

export const getCardsList = (cardId: CardId, fromLists?: List[]): List | null => {
    if(!fromLists){
        return null;
    }
    let list: List | null = null;
    fromLists.forEach(l=>{
        l.cards.forEach(c=>{
            if(c.id === cardId)
                list = l;
        })
    })
    return list;
}

export const getCardNumber = (boardCode: string, cardNumber:number)=> {
    return boardCode ? (`${boardCode}-${cardNumber}`) : `# ${cardNumber}`;
}