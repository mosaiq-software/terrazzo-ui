import {List, Card} from "@mosaiq/terrazzo-common/types";

export const getCard = (cardId: string, inLists?: List[]): Card | null => {
    if(!inLists){
        return null;
    }
    let card: Card | null = null;
    inLists.forEach(l=>{
        l.cards.forEach(c=>{
            if(c.id === cardId)
                card = c;
        })
    })
    return card;
}

export const getList = (listId: string, fromLists?: List[]): List | null => {
    return fromLists?.find(l=>l.id === listId) ?? null;
}

export const getCardsList = (cardId: string, fromLists?: List[]): List | null => {
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