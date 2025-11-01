import React, { useState, useEffect, useCallback, ChangeEventHandler } from 'react'
import { Button, Modal, Input, Text, Divider } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { To, NavLink, useLocation } from 'react-router'
import Fuse from 'fuse.js'

import { OrganizationId, Project, ProjectId, BoardRes, BoardId, Card, CardId  } from '@mosaiq/terrazzo-common/types'
import { getOrganizationData, getProjectData, getBoardData, getCardData } from '@trz/emitters/all'
import { useDashboard } from "@trz/contexts/dashboard-context"
import { NoteType, notify } from "@trz/util/notifications"
import { useSocket } from '@trz/contexts/socket-context'
import './AutoComplete.css'

// NOTE(ttph): Keywords for filtering
enum categoryIds 
{
    organization = "@org",
    project = "@project",
    board = "@board",
    card = "@card",
}

// TODO(ttph): Better object structure for fuzzy searching
type SearchObject = { title: string; category: string; }
interface SearchObject_Projs  extends SearchObject { object: Project; }
interface SearchObject_Boards extends SearchObject { object: BoardRes; }
interface SearchObject_Cards  extends SearchObject { board: string; object: Card; }

// NOTE(ttph): Different meaning for conceptual reasons
type Object_Projs  = SearchObject_Projs
type Object_Boards = SearchObject_Boards
type Object_Cards  = SearchObject_Cards

type SearchQuery = {
    pattern: string;
    searchObjects: {
        [key:string]: SearchObject[]
    }
}

type SearchResults = {
    projResults:  Object_Projs[];
    boardResults: Object_Boards[];
    cardResults:  Object_Cards[];
}


// TODO(ttph): Implement Data Caching
export function AutoComplete() {
    const [ searchPattern, setSearchPattern ] = useState<string>("");
    const [ searchQuery, setSearchQuery ] = useState<SearchQuery | undefined>(undefined);
    const [ searchResults, setSearchResults ] = useState<SearchResults | undefined>(undefined);
    const [ opened, { close, open } ] = useDisclosure(false);
    const { userDash }                = useDashboard();
    const sockCtx                     = useSocket();
    const location = useLocation();

    useEffect(() => {
        close();
    }, [location]);

    const fetchOrganizationData = useCallback(async (orgId: OrganizationId) => {
        if (!orgId || !sockCtx.connected) return;

        try {
            return await getOrganizationData(sockCtx, orgId);
        } catch (err) {
            notify(NoteType.ORG_DATA_ERROR, err);
            return;
        }
    }, [sockCtx]);

    const fetchProjectData = useCallback(async (projectId: ProjectId) => {
        await new Promise((resolve) => setTimeout(resolve, 0));
        if (!projectId || !sockCtx.connected) return;

        try {
            return await getProjectData(sockCtx, projectId);
        } catch (err) {
            notify(NoteType.PROJECT_DATA_ERROR, err);
            return;
        }
    }, [sockCtx]);

    const fetchBoardData = useCallback(async (boardId: BoardId) => {
        await new Promise((resolve) => setTimeout(resolve, 0));
        if (!boardId || !sockCtx.connected) return;

        try {
            return await getBoardData(sockCtx, boardId);
        } catch (err) {
            notify(NoteType.PROJECT_DATA_ERROR, err);
            return;
        }
    }, [sockCtx]);

    const fetchCardData = useCallback(async (cardId: CardId) => {
        await new Promise((resolve) => setTimeout(resolve, 0));
        if (!cardId || !sockCtx.connected) return;

        try {
            return await getCardData(sockCtx, cardId);
        } catch (err) {
            notify(NoteType.PROJECT_DATA_ERROR, err);
            return;
        }
    }, [sockCtx]);

    // NOTE(ttph): fetches all data associated with a user 
    useEffect(() => {
        if (!userDash || !sockCtx.connected) return;

        const getData = setTimeout(() => 
        {
            const fuse_search_query = { 
                pattern: searchPattern, 
                searchObjects: {
                   projs:  [], 
                   boards: [], 
                   cards:  [] 
                }
            } as SearchQuery;

            userDash.organizations.map(async (organization) => {
                const org_data = await fetchOrganizationData(organization.id);
                if (!org_data) { return; }

                org_data.projects.map(async (project) => {
                    const project_data = await fetchProjectData(project.id);
                    if (!project_data) { return; }

                    const searchObjectProj = { 
                        title: project_data.name, 
                        category: categoryIds.project, 
                        object: project_data 
                    };

                    fuse_search_query.searchObjects.projs.push(searchObjectProj);

                    project_data.boards.map(async (board) => {
                        const board_data = await fetchBoardData(board.id);
                        if (!board_data) { return; }

                        const searchObjectBoard = { 
                            title: board_data.name, 
                            category: categoryIds.board, 
                            object: board_data 
                        };

                        fuse_search_query.searchObjects.boards.push(searchObjectBoard);

                        await Promise.all(board_data.lists.map(async (list) => {
                            list.cardIds.map(async (cardId) => {
                                const card_data = await fetchCardData(cardId);
                                if (!card_data) { return; }

                                const searchObjectCard = { 
                                    title: card_data.name, 
                                    category: categoryIds.card,
                                    board: board_data.name, 
                                    object: card_data 
                                };

                                fuse_search_query.searchObjects.cards.push(searchObjectCard);
                                setSearchQuery(fuse_search_query);
                            });
                        }));
                    });
                });
            });
        }, 100);

        return () => clearTimeout(getData);
    }, [searchPattern, userDash, sockCtx.connected]);

    useEffect(() => {
        if (!searchQuery) return;

        // TODO(ttph): Filtering

        const searchPattern = searchQuery.pattern;
        const fuseSearchResults = { projResults: [], boardResults: [], cardResults: [] } as SearchResults;

        const fuseProjs = new Fuse(searchQuery.searchObjects.projs, { keys: ['title', 'category'] });
        fuseProjs.search(searchPattern).map((result) => {
            fuseSearchResults.projResults.push(result.item as SearchObject_Projs);
        });

        const fuseBoards = new Fuse(searchQuery.searchObjects.boards, { keys: ['title', 'category'] });
        fuseBoards.search(searchPattern).map((result) => {
            fuseSearchResults.boardResults.push(result.item as SearchObject_Boards);
        });

        const fuseCards = new Fuse(searchQuery.searchObjects.cards, { keys: ['title', 'category', 'board'] });
        fuseCards.search(searchPattern).map((result) => {
            fuseSearchResults.cardResults.push(result.item as SearchObject_Cards);
        });

        setSearchResults(fuseSearchResults);
    }, [searchQuery])

    // fuzzy finding operations
    const handleUserInput = useCallback<ChangeEventHandler<HTMLInputElement>>((event) => {
        setSearchPattern(event.currentTarget.value);
    }, []);

    return (
        <>
            <Button
                onClick={open}
                classNames={{
                    root: 'Search-Button-root',
                    inner: 'Search-Button-inner',
                }}>
                Search
            </Button>
            <Modal.Root opened={opened} onClose={close}>
                <Modal.Overlay />
                <Modal.Content>
                    <Modal.Body classNames={{
                        body: 'Spotlight-Modal-body',
                    }}>
                        <Input onInput={handleUserInput}></Input>
                        {(!searchResults) ? undefined:(
                            <>
                                {(searchResults.projResults.length == 0)?undefined:(
                                    <AutoCompleteItemList text={'Projects'}>
                                        {searchResults.projResults.map((results, index) => {
                                            return (
                                                <AutoCompleteItem 
                                                    key={`projects${index.toString()}${results.title}`}
                                                    text={results.title}
                                                    href={`/project/${results.object.id}`}
                                                />
                                            );
                                        })}
                                    </AutoCompleteItemList>
                                )}

                                {(searchResults.boardResults.length == 0)?undefined:(
                                    <AutoCompleteItemList text={'Boards'}>
                                        {searchResults.boardResults.map((results, index) => {
                                            return (
                                                <AutoCompleteItem 
                                                    key={`boards${index.toString()}${results.title}`}
                                                    text={results.title}
                                                    href={`/board/${results.object.id}`}
                                                />
                                            );
                                        })}
                                    </AutoCompleteItemList>
                                )}

                                {(searchResults.cardResults.length == 0)?undefined:(
                                    <AutoCompleteItemList text={'Cards'}>
                                        {searchResults.cardResults.map((results, index) => {
                                            return (
                                                <AutoCompleteItem 
                                                    key={`cards${index.toString()}${results.title}`}
                                                    text={results.title}
                                                    href={`/card/${results.object.id}`}
                                                />
                                            );
                                        })}
                                    </AutoCompleteItemList>
                                )}
                            </>
                        )}
                    </Modal.Body>
                </Modal.Content>
            </Modal.Root>
        </>
    )
}


interface PropsAutoCompleteItemList {
    children: React.ReactNode;
    text: string;
};

const AutoCompleteItemList = ({ text, children }:PropsAutoCompleteItemList) => {
    return (
        <div className={'AutoComplete-ItemList-container'}>
            <Text className={'AutoComplete-ItemList-text'}>{text}</Text>
            <Divider/>
            {children}
        </div>
    )
}

interface PropsAutoCompleteItem {
    text: string;
    href: To;
    onMouseDown?: React.MouseEventHandler;
}
const AutoCompleteItem = ({ text, href, onMouseDown }:PropsAutoCompleteItem) => {
    return (
        <NavLink to={href}>
            <div data-href={href} className={'AutoComplete-Item-container'} onMouseDown={onMouseDown}>
                <Text className={'AutoComplete-Item-text'}>{text}</Text>
            </div>
        </NavLink>
    )
}

