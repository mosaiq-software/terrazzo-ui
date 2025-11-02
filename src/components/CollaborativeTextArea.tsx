import { TextBlockId } from "@mosaiq/terrazzo-common/types";
import React, {useEffect, useRef, useState} from "react";

import { Editor, rootCtx } from "@milkdown/kit/core";
import { commonmark } from "@milkdown/kit/preset/commonmark";
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react";
import { nord } from "@milkdown/theme-nord";

import { collab, CollabService, collabServiceCtx } from "@milkdown/plugin-collab";
import { cursor } from '@milkdown/kit/plugin/cursor'
import { SocketIOProvider } from 'y-socket.io';
import { Doc } from "yjs";


interface CollaborativeTextAreaProps {
    maxLineLength: number;
    textBlockId: TextBlockId;
    fontSize?: number;
    showOwnCursorAsCustom?: boolean; // should the cursor be a custom one (T) or the default browser one (F/u).
    textColor: string;
    backgroundColor: string;
    markdown?: boolean;
    placeholder: string;
}

const MilkdownEditor = () => {
    const [editor, setEditor] = useState<Editor | undefined>(undefined);
    const [collabService, setCollabService] = useState<CollabService | undefined>(undefined);
    const [doc, setDoc] = useState<Doc | null>(null);
    const [provider, setProvider] = useState<SocketIOProvider | null>(null);
    const [status, setStatus] = useState<string>('disconnected');
    const [clients, setClients] = useState<string[]>([]);

    const { get } = useEditor((root) =>
        Editor.make()
        .config(nord)
        .config((ctx) => {
            ctx.set(rootCtx, root);
        })
        .use(commonmark)
        .use(collab)
        .use(cursor)
    );

    useEffect(()=>{
        async function setup(ed: Editor) {
            setEditor(ed);

            const doc = new Doc();
            
            const url = process.env.SOCKET_URL;
            if (!url)
                throw new Error("SOCKET_URL environment variable is not set");
            const socketIOProvider = new SocketIOProvider(url, 'testing-doc', doc,
                {
                    autoConnect: true,
                },
                {
                    path: "/socket"
                }
            );
            socketIOProvider.awareness.on('change', () => setClients(Array.from(socketIOProvider.awareness.getStates().keys()).map(key => `${key}`)))
            socketIOProvider.awareness.setLocalState({ id: Math.random(), name: 'Perico' });
            socketIOProvider.on('sync', (isSync: boolean) => console.log('websocket sync', isSync))
            socketIOProvider.on('status', ({ status: _status }: { status: string }) => {
                setStatus(_status);
            })
            setProvider(socketIOProvider);

            ed.action((ctx) => {
                const clbServ = ctx.get(collabServiceCtx);
                setCollabService(clbServ);
                clbServ.bindDoc(doc).setAwareness(socketIOProvider.awareness).connect();
            });
        }

        if (get && !editor) {
            const ed = get();
            if (ed) {
                setEditor(ed);
                setup(ed);
            }
        }

    }, [get]);


    const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        if (!doc) return;
        const yMap = doc.getMap('data');
        yMap.set('input', e.target.value ?? '')
    }

    const handleConnect = () => {
        provider?.connect();
        collabService?.connect();
    }

    const handleDisconnect = () => {
        provider?.disconnect();
        collabService?.disconnect();
    }

    return (
        <div>
            <div style={{ color: 'white' }}>
                <div>
                    <p>State: {status}</p>
                    <button onClick={status === 'connected' ? handleDisconnect : handleConnect}>
                        {status === 'connected' ? 'Disconnect' : 'Connect'}
                    </button>
                </div>
                <pre>
                    {JSON.stringify(clients, null, 4)}
                </pre>
                <Milkdown />
            </div>
        </div>
    )
};

export const CollaborativeTextArea = (props: CollaborativeTextAreaProps) => {
    return (
        <MilkdownProvider>
            <MilkdownEditor />
        </MilkdownProvider>
    );
};