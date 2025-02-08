import { TextBlockEvent } from '@mosaiq/terrazzo-common/types';
import { useState } from 'react';

export function useBuffer<T>() {
    const [buffer, setBuffer] = useState<T[]>([]);

    const drain = (): T[] => {
        const b = buffer;
        setBuffer([]);
        return b;
    };

    const push = (item:T): void => {
        setBuffer([...buffer, item]);
    };

    const pushMany = (items:T[]): void => {
        setBuffer([...buffer, ...items]);
    };

    return {
        drain,
        push,
        pushMany,
        buffer
    }
};