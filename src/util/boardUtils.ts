export const getCardNumber = (boardCode: string, cardNumber:number)=> {
    return boardCode ? (`${boardCode}-${cardNumber}`) : `# ${cardNumber}`;
}