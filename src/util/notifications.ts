import { notifications } from '@mantine/notifications';

const AUTO_CLOSE_TIMEOUT = 5000;
enum NoteColor {
    ERROR = 'red',
    INFO = 'blue',
    WARNING = 'yellow',
    SUCCESS = 'green',
}
interface Note {
    title: string;
    message?: string;
    color?: NoteColor;
}
export const NoteType = {
    CONNECTION_ERROR: {
        title: 'Connection Error',
        message: 'An error occurred while connecting to the server. Could not upgrade to websocket',
    },
    DISCONNECTED: {
        title: 'Disconnected',
        message: 'You have been disconnected from the server',
    },
    RECONNECTING: {
        title: 'Reconnecting',
        message: 'Searching for server...',
        color: NoteColor.INFO,
    },
    RECONNECTING_SERVER_FOUND: {
        title: 'Reconnecting',
        message: 'Server found. Attempting to reconnect',
        color: NoteColor.INFO,
    },
    CONNECTION_ESTABLISHED: {
        title: 'Connected',
        message: 'You have been connected to the server',
        color: NoteColor.SUCCESS,
    },
    GITHUB_AUTH_ERROR: {
        title: 'GitHub Authentication Error',
        message: 'An error occurred while authenticating with GitHub',
    },
    GITHUB_DATA_ERROR: {
        title: 'GitHub Data Error',
        message: 'An error occurred while fetching data from GitHub',
    },
    BOARD_DATA_ERROR: {
        title: 'Board Data Error',
        message: 'An error occurred while fetching data from Board',
    },
    BOARD_CREATION_ERROR: {
        title: 'Board Creation Error',
        message: 'An error occurred while creating a new board',
    },
    LIST_CREATION_ERROR: {
        title: 'List Creation Error',
        message: 'An error occurred while creating a new list',
    },
    CARD_CREATION_ERROR: {
        title: 'Card Creation Error',
        message: 'An error occurred while creating a new card',
    },
    LIST_UPDATE_ERROR: {
        title: 'List Update Error',
        message: 'An error occurred while updating the list',
    },
    CLIPBOARD_COPY_ERROR: {
        title: 'Error copying text',
        message: 'Make sure the browser has this permission enabled',
    },
    CLIPBOARD_PASTE_ERROR: {
        title: 'Error pasting text',
        message: 'Make sure the browser has this permission enabled',
    },
    TEXT_BLOCK_INIT_ERROR: {
        title: "Error initializing text block"
    },
    TEXT_EVENT_WARN: {
        title: "Error updating text block",
        color: NoteColor.WARNING
    },
    ORG_CREATION_ERROR: {
        title: "Error creating the organization"
    },
    ORG_DATA_ERROR: {
        title: "Error getting the organization"
    },
    PROJECT_CREATION_ERROR: {
        title: "Error creating the project"
    },
    PROJECT_DATA_ERROR: {
        title: "There was an error getting the project's data"
    }

}

export const notify = (note?: Note) => {
    if (!note) {
        note = {
            title: "An error occurred"
        }
    }
    notifications.show({
        title: note.title,
        message: note.message || "",
        color: note.color || NoteColor.ERROR,
        autoClose: AUTO_CLOSE_TIMEOUT,
    });
}