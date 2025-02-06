import { notifications } from '@mantine/notifications';

export enum NoteType {
    CONNECTION_ERROR = 'CONNECTION_ERROR',
    DISCONNECTED = 'DISCONNECTED',
    RECONNECTING = 'RECONNECTING',
    RECONNECTING_SERVER_FOUND = 'RECONNECTING_SERVER_FOUND',
    CONNECTION_ESTABLISHED = 'CONNECTION_ESTABLISHED',
    GITHUB_AUTH_ERROR = 'GITHUB_AUTH_ERROR',
    GITHUB_DATA_ERROR = 'GITHUB_DATA_ERROR',
    BOARD_DATA_ERROR = 'BOARD_DATA_ERROR',
    BOARD_CREATION_ERROR = 'BOARD_CREATION_ERROR',
    LIST_CREATION_ERROR = 'LIST_CREATION_ERROR',
    CARD_CREATION_ERROR = 'CARD_CREATION_ERROR',
}

const AUTO_CLOSE_TIMEOUT = 5000;
enum NoteColor {
    ERROR = 'red',
    INFO = 'blue',
    WARNING = 'yellow',
    SUCCESS = 'green',
}

const noteMap = {
    [NoteType.CONNECTION_ERROR]: {
        title: 'Connection Error',
        message: 'An error occurred while connecting to the server. Could not upgrade to websocket',
        color: NoteColor.ERROR,
    },
    [NoteType.DISCONNECTED]: {
        title: 'Disconnected',
        message: 'You have been disconnected from the server',
        color: NoteColor.ERROR,
    },
    [NoteType.RECONNECTING]: {
        title: 'Reconnecting',
        message: 'Searching for server...',
        color: NoteColor.INFO,
    },
    [NoteType.RECONNECTING_SERVER_FOUND]: {
        title: 'Reconnecting',
        message: 'Server found. Attempting to reconnect',
        color: NoteColor.INFO,
    },
    [NoteType.CONNECTION_ESTABLISHED]: {
        title: 'Connected',
        message: 'You have been connected to the server',
        color: NoteColor.SUCCESS,
    },
    [NoteType.GITHUB_AUTH_ERROR]: {
        title: 'GitHub Authentication Error',
        message: 'An error occurred while authenticating with GitHub',
        color: NoteColor.ERROR,
    },
    [NoteType.GITHUB_DATA_ERROR]: {
        title: 'GitHub Data Error',
        message: 'An error occurred while fetching data from GitHub',
        color: NoteColor.ERROR,
    },
    [NoteType.BOARD_DATA_ERROR]: {
        title: 'Board Data Error',
        message: 'An error occurred while fetching data from Board',
        color: NoteColor.ERROR,
    },
    [NoteType.BOARD_CREATION_ERROR]: {
        title: 'Board Creation Error',
        message: 'An error occurred while creating a new board',
        color: NoteColor.ERROR,
    },
    [NoteType.LIST_CREATION_ERROR]: {
        title: 'List Creation Error',
        message: 'An error occurred while creating a new list',
        color: NoteColor.ERROR,
    },
    [NoteType.CARD_CREATION_ERROR]: {
        title: 'Card Creation Error',
        message: 'An error occurred while creating a new card',
        color: NoteColor.ERROR,
    },
}

export const notify = (note: NoteType) => {
    const noteData = noteMap[note];
    if (!noteData) {
        throw new Error(`Notification type ${note} not found`);
    }
    notifications.show({
        ...noteData,
        autoClose: AUTO_CLOSE_TIMEOUT,
    });
}