import {ListId} from "../../../terrazzo-common/dist/types";
import {SocketContextType} from "@trz/util/socket-context";

export function getMonthName(month: number): string {
    return new Date(0, month).toLocaleString('en', { month: 'long' }).slice(0, 3);
}

export function getSprintFromId(sprintId: ListId | null, sockCtx:SocketContextType): string {
    if (!sprintId) return '';
    const sprint = sockCtx.boardData?.lists.find(list => list.id === sprintId);
    return sprint ? sprint.name : '';
}