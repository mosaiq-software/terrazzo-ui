import React, { FC, PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import { IdentifierSchemaAttributes } from 'remirror';
import {
  EmojiExtension,
  MentionAtomExtension,
  MentionAtomNodeAttributes,
  PlaceholderExtension,
  wysiwygPreset,
  AnnotationExtension
} from 'remirror/extensions';
import data from 'svgmoji/emoji.json';
import { TableComponents, TableExtension } from '@remirror/extension-react-tables';
import { i18nFormat } from '@remirror/i18n';
import {
  EditorComponent,
  EmojiPopupComponent,
  MentionAtomPopupComponent,
  MentionAtomState,
  Remirror,
  ThemeProvider,
  useRemirror,
} from '@remirror/react';
import { AllStyledComponent } from '@remirror/styles/emotion';
import { TextBlockId } from '@mosaiq/terrazzo-common/types';
import type { AnyExtension, CreateEditorStateProps } from 'remirror';
import type { RemirrorProps, UseThemeProps } from '@remirror/react';
import { FloatingToolbar, WysiwygToolbar } from '@remirror/react-ui';
import { YjsExtension } from '@remirror/extension-yjs';
import { ProviderConfiguration, SocketIOProvider } from "@trz/util/yjsSocketProvier";
import { Doc } from "yjs";
import { ManagerOptions, SocketOptions } from 'socket.io-client';
import { useImageColor } from '@trz/hooks/useImageColor';

export interface ReactEditorProps
    extends Pick<CreateEditorStateProps, 'stringHandler'>,
        Pick<
        RemirrorProps,
        | 'initialContent'
        | 'editable'
        | 'autoFocus'
        | 'hooks'
        | 'i18nFormat'
        | 'locale'
        | 'supportedLocales'
        > {
    placeholder?: string;
    theme?: UseThemeProps['theme'];
}

const extraAttributes: IdentifierSchemaAttributes[] = [
    {
        identifiers: ['mention', 'emoji'],
        attributes: { role: { default: 'presentation' } },
    },
    { identifiers: ['mention'], attributes: { href: { default: null } } },
];

export interface SocialEditorProps extends Partial<ReactEditorProps>, Pick<MentionComponentProps, 'users' | 'tags'> {}

interface MentionComponentProps<UserData extends MentionAtomNodeAttributes = MentionAtomNodeAttributes> {
    users?: UserData[];
    tags?: string[];
}

function MentionComponent({ users, tags }: MentionComponentProps) {
    const [mentionState, setMentionState] = useState<MentionAtomState | null>();
    const tagItems = useMemo(
        () => (tags ?? []).map((tag) => ({ id: tag, label: `#${tag}` })),
        [tags],
    );
    const items = useMemo(() => {
        if (!mentionState) {
            return [];
        }

        const allItems = mentionState.name === 'at' ? users : tagItems;

        if (!allItems) {
            return [];
        }

        const query = mentionState.query.full.toLowerCase() ?? '';
        return allItems.filter((item) => item.label.toLowerCase().includes(query)).sort();
    }, [mentionState, users, tagItems]);

    return <MentionAtomPopupComponent onChange={setMentionState} items={items} />;
}

interface EditorWrapperProps extends PropsWithChildren<SocialEditorProps>, SharedCollaborativeTextAreaProps {}

const EditorWrapper = (props: EditorWrapperProps) => {
    const IDLE_COLOR = "#afafaf";
    const imgColor = useImageColor(props.avatarUrl);
    const [socketIOProvider, setSocketIOProvider] = useState<SocketIOProvider | undefined>();
    const [status, setStatus] = useState<string>('disconnected');
    const [clients, setClients] = useState<string[]>([]);

    useEffect(()=>{
        let _socketIOProvider: SocketIOProvider;
        const init = async () => {
            const doc = new Doc();
            const url = process.env.SOCKET_URL;
            if (!url)
                throw new Error("SOCKET_URL environment variable is not set");
            const textBlockId = props.textBlockId;
            const pConf:ProviderConfiguration = {
                autoConnect: true,
            };
            const sockConf: Partial<ManagerOptions & SocketOptions> = {
                path: "/socket"
            };
            _socketIOProvider = new SocketIOProvider(url, textBlockId, doc, pConf, sockConf);
            setSocketIOProvider(_socketIOProvider);
        };
        init();

        return () => {
            _socketIOProvider?.destroy();
        };
    }, [])

    useEffect(()=>{
        if(!socketIOProvider){
            return;
        }
        socketIOProvider.awareness.on('change', () => setClients(Array.from(socketIOProvider.awareness.getStates().keys()).map(key => `${key}`)))
        socketIOProvider.awareness.setLocalStateField('user', {
            name: props.name || 'Unknown User',
            color: props.idle ? IDLE_COLOR : imgColor ?? props.color ?? "black",
        });
        socketIOProvider.on('sync', (isSync: boolean) => console.log('websocket sync', isSync))
        socketIOProvider.on('status', ({ status: _status }: { status: string }) => {
            setStatus(_status);
        })
    }, [socketIOProvider, imgColor, props.color, props.idle, props.name])

    if (!socketIOProvider) {
        return <div>Loading editor...</div>;
    }

    return (
        <Editor
            socketIOProvider={socketIOProvider}
            {...props}
        />
    )
};

interface EditorProps extends EditorWrapperProps {
    socketIOProvider: SocketIOProvider;
}
const Editor = (props:EditorProps) => {
    const extensions = useCallback(()=>{
        const extensions: AnyExtension[] = [
            new AnnotationExtension({}),
            new PlaceholderExtension({ placeholder:props.placeholder }),
            new TableExtension({}),
            new MentionAtomExtension({
                matchers: [
                    { name: 'at', char: '@' },
                    { name: 'tag', char: '#' },
                ],
            }),
            new EmojiExtension({ plainText: false, data: data as any, moji: 'noto' }),
            new YjsExtension({ getProvider: () => props.socketIOProvider }),
            ...wysiwygPreset()
        ];
        return extensions;
    }, [props.placeholder]);

    const { manager, state } = useRemirror({
        extensions,
        extraAttributes,
        stringHandler: props.stringHandler,
    });

    return (
        <AllStyledComponent>
            <ThemeProvider theme={props.theme}>
                <Remirror manager={manager} i18nFormat={i18nFormat} initialContent={state}>
                    <TopToolbar />
                    <EditorComponent />
                    <EmojiPopupComponent />
                    <MentionComponent users={props.users} tags={props.tags} />
                    <TableComponents />
                    <BubbleMenu />
                    {props.children}
                </Remirror>
            </ThemeProvider>
        </AllStyledComponent>
    );
}

interface SharedCollaborativeTextAreaProps {
    maxLineLength: number;
    textBlockId: TextBlockId;
    fontSize?: number;
    textColor: string;
    backgroundColor: string;
    placeholder?: string;
    name? : string;
    color?: string;
    avatarUrl?: string;
    idle: boolean;
}

export const CollaborativeTextArea = (props: SharedCollaborativeTextAreaProps) => {
    return (
        <EditorWrapper
            editable={true}
            {...props}
        />
    );
};

const BubbleMenu: FC = () => <FloatingToolbar />;
const TopToolbar: FC = () => <WysiwygToolbar />;