export function getMonthName(month: number): string {
    return new Date(0, month).toLocaleString('en', { month: 'long' }).slice(0, 3);
}