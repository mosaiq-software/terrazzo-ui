import React from 'react';
import { Card, Button, Container, ContainerProps, Divider, Group, Kbd, Text, Textarea, Title, TitleOrder, Table, Blockquote, Tabs, Anchor, HoverCard, Flex, Image } from '@mantine/core';
import Emoji from 'emojilib';
import LinkPreview from '@ashwamegh/react-link-preview';
import { RiArrowRightUpBoxLine, RiLink } from "react-icons/ri";

interface MarkdownTextareaProps extends ContainerProps{
    children: string;
}

export const MarkdownTextarea = (props:MarkdownTextareaProps) => {
    if(typeof props.children !== "string") {
        return <Text>Markdown Error: Value is not a string</Text>
    }
    return (
        <Container {...props}>
            {renderMarkdown(props.children)}
        </Container>
    );
}


const processBlockquotes = (lines: Line[], rootKey: number): JSX.Element => {
    interface BQTreeNode {
        parent: BQTreeNode | null,
        children: (BQTreeNode | Line[])[],
        depth: number,
        color?: string
    }

    const bqDefaultColor = 'white';
    const bqStyles = new Map([
        ['{.is-danger}', 'red'],
        ['{.is-warning}', 'yellow'],
        ['{.is-success}', 'green'],
        ['{.is-info}', 'blue'],
    ])

    const groups: Line[][] = [];
    let currentGroup: Line[] = [lines[0]];
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].blockquoteLevel == currentGroup[0].blockquoteLevel) {
            currentGroup.push(lines[i]);
        } else {
            groups.push([...currentGroup]);
            currentGroup = [lines[i]];
        }
    }
    groups.push([...currentGroup]);

    const root: BQTreeNode = {
        parent: null,
        children: [],
        depth: 0
    };
    let currentNode = root;

    groups.forEach((group) => {
        const parentDepth = group[0].blockquoteLevel! - 1;
        while (parentDepth > currentNode.depth) {
            const newNode: BQTreeNode = {
                parent: currentNode,
                children: [],
                depth: currentNode.depth + 1
            }
            currentNode.children = [...currentNode.children, newNode];
            currentNode = newNode;
        }
        while (parentDepth < currentNode.depth) {
            if (currentNode.parent == null) {
                break;
            } else {
                currentNode = currentNode.parent;
            }
        }
        currentNode.children = [...currentNode.children, group];
    })

    const colorNodeAndChildren = (node: BQTreeNode) => {
        if (node.children.length > 0) {
            const lastChild = node.children[node.children.length - 1];
            if (Array.isArray(lastChild)) {
                const lastChildID = lastChild.length - 1;
                const lastLine = lastChild[lastChildID];
                const lastContent = lastLine.content;
                if (lastContent.length > 0) {
                    const color = bqStyles.get(lastContent[0].text);
                    if (color != undefined) {
                        node.color = color;
                        node.children[node.children.length - 1] = lastChild.filter((_,i) => i < lastChildID);
                    }
                }
            }
            if (node.color == undefined) {
                node.color = node.parent == null ? bqDefaultColor : node.parent.color;
            }
            for (const childNode of node.children) {
                if (!Array.isArray(childNode)) {
                    colorNodeAndChildren(childNode);
                }
            }
        }
    }

    colorNodeAndChildren(root);

    const treeToElements = (node: BQTreeNode, key: number): JSX.Element => {
        return (<Blockquote p='sm'
                            key={key}
                            color={node.color == undefined ? bqDefaultColor : node.color}>
            {node.children.map((childNode, id) => {
                if (Array.isArray(childNode)) {
                    return childNode.map((line, lineID) => <Text key={`${id}-${lineID}`}>
                        {renderLineContent(line.content)}
                    </Text>);
                } else {
                    return treeToElements(childNode, id);
                }
            })}
        </Blockquote>);
    }

    return treeToElements(root, rootKey);
}

const nextLinesOfType = (lines: Line[], type: LineType, startingAt: number) => {
    const group: Line[] = [];
    for (let i = startingAt; i < lines.length; i++) {
        if (lines[i].type == type) {
            group.push(lines[i])
        } else {
            break;
        }
    }
    return group;
}

const constructTabsetLines = (lines: Line[]) => {

    const head: (Line | Tabset)[] = [];
    let currentTarget: (Line | Tabset)[] = head;
    let currentTabset: (Tabset | null) = null;
    const stack: number[] = [];

    const adjustTarget = () => {
        if (currentTabset == null) {
            currentTarget = head;
        } else {
            currentTarget = currentTabset.tabs[currentTabset.tabs.length - 1].content;
        }
    }

    for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        const line = {...rawLine, content: rawLine.content.map((lc) => {
                return {...lc, text: lc.text.replace(/{.tabset}/, '')};
            })}
        if (line.type != LineType.Heading) {
            currentTarget.push(line);
        } else {
            while (currentTabset != null && (currentTabset as Tabset).selfLevel >= line.headingLevel!) {
                currentTabset = (currentTabset as Tabset).parent;
            }
            while (stack.length > 0 && stack[0] > line.headingLevel!) {
                stack.shift();
            }

            adjustTarget();

            if (line.headingLevel! == stack[0]) {
                if (currentTabset == null || currentTabset.childLevel < line.headingLevel!) {
                    const newTabset: Tabset = {
                        parent: currentTabset,
                        tabs: [],
                        selfLevel: line.headingLevel! - 1,
                        childLevel: line.headingLevel!
                    };
                    currentTarget.push(newTabset);
                    currentTabset = currentTarget[currentTarget.length - 1] as Tabset;
                }
                const newTab: Tab = {
                    heading: line,
                    content: []
                };
                currentTabset.tabs.push(newTab);
            } else {
                currentTarget.push(line);
            }

            adjustTarget();

            if (rawLine.content.some((c) => (/{.tabset}/.test(c.text)))) {
                stack.unshift(line.headingLevel! + 1);
            }
        }
    }

    return head;
}

const renderMarkdown = (markdown: string): JSX.Element[] => {
    const rawLines = markdown.split('\n');
    const lines: Line[] = rawLines.map((line) => {
        return extractLineData(line);
    });

    const outerTabsetLines: (Line | Tabset)[] = constructTabsetLines(lines);



    const renderMarkdownRecursive = (tabsetLines: (Line | Tabset)[]): JSX.Element[] => {
        const elements: JSX.Element[] = [];
        let lineGroup: Line[] = [];
        let key = 0;
        tabsetLines.forEach((tl, i) => {
            if ('tabs' in tl) { // if tabset
                elements.push(...processLines(lineGroup, key), <Tabs defaultValue='0' key={i}>
                    <Tabs.List>
                        {tl.tabs.map((t,i) =>
                            <Tabs.Tab value={`${i}`} key={i}>
                                {renderLineContent(t.heading.content)}
                            </Tabs.Tab>)}
                    </Tabs.List>
                    {tl.tabs.map((t,i) =>
                        <Tabs.Panel value={`${i}`} key={i}>
                            {renderMarkdownRecursive(t.content)}
                        </Tabs.Panel>)}
                </Tabs>);
                key += lineGroup.length + 1;
                lineGroup = [];
            } else { // if line
                lineGroup.push(tl);
            }
        })
        key += lineGroup.length + 1;
        elements.push(...processLines(lineGroup, key));
        return elements;
    }

    return renderMarkdownRecursive(outerTabsetLines);
}

const processLines = (lines: Line[], startKey: number): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        switch (line.type) {
            case LineType.Blockquote: {
                const blockquoteLines: Line[] = nextLinesOfType(lines, LineType.Blockquote, i);
                i += blockquoteLines.length - 1;
                elements.push(processBlockquotes(blockquoteLines, startKey + i));
                break;
            }
            case LineType.Table: {
                const tableLines: Line[] = nextLinesOfType(lines, LineType.Table, i);
                i += tableLines.length - 1;
                const tableContents = tableLines
                    .filter((line, id) => !(id == 1 && /^[-|:]+$/.test(line.line)))
                    .map((line) => line.tableContent!
                        .filter((_, id) => id != 0 && id != line.tableContent!.length - 1))
                let colAlignments: ('center' | 'left' | 'right')[] = []
                if (tableLines.length > 1) {
                    const indicatorLine = tableLines[1].line;
                    if (/^[-|:]+$/.test(indicatorLine)) {
                        colAlignments = indicatorLine.slice(1,-1).split('|').map((indicator) => {
                            const startsWithColon = indicator.startsWith(':');
                            const endsWithColon = indicator.endsWith(':');
                            return startsWithColon
                                ? (endsWithColon ? 'center' : 'left')
                                : (endsWithColon ? 'right' : 'left');
                        });
                    }
                }
                const tableHeader = tableContents[0];
                const tableBody = tableContents.filter((row, id) => id > 0);
                elements.push(
                    <Table key={startKey + i}>
                        <Table.Thead>
                            <Table.Tr>
                                {tableHeader.map((cell, cellID) =>
                                    <Table.Th
                                        key={cellID}
                                        style={{textAlign: colAlignments[cellID] ?? 'left'}}>
                                        {renderLineContent(cell)}
                                    </Table.Th>)}
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {tableBody.map((row, rowID) => <Table.Tr key={rowID}>
                                {row.map((cell, cellID) =>
                                    <Table.Td key={cellID}
                                              style={{textAlign: colAlignments[cellID] ?? 'left'}}>
                                        {renderLineContent(cell)}
                                    </Table.Td>)}
                            </Table.Tr>)}
                        </Table.Tbody>
                    </Table>
                )
                break;
            }
            case LineType.Heading:
                elements.push(
                    <Title key={startKey + i} style={{ marginLeft: `${line.indentLevel * 20}px`}} order={line.headingLevel as TitleOrder}>
                        {renderLineContent(line.content)}
                    </Title>
                );
                break;
            case LineType.ListItem:
                elements.push(
                    <Text key={startKey + i} style={{ marginLeft: `${line.indentLevel * 20}px`}}>
                        <Text span fw={700}>•</Text> {renderLineContent(line.content)}
                    </Text>
                );
                break;
            case LineType.HorizontalRule:
                elements.push(<Divider key={startKey + i} />);
                break;
            case LineType.LineBreak:
                elements.push(<br key={startKey + i} />);
                break;
            case LineType.Paragraph:
            default:
                elements.push(
                    <Text key={startKey + i} style={{ marginLeft: `${line.indentLevel * 20}px`}}>
                        {renderLineContent(line.content)}
                    </Text>
                );
                break;
        }
    }

    return elements;
}

const renderLineContent = (content: LineContent[]): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    for (let i = 0; i < content.length; i++) {
        const item = content[i];
        if (item.text === '') {
            continue;
        }
        switch (item.style) {
            case LineContentStyle.Bold:
                elements.push(<Text span inherit key={i} fw={900}>{item.text}</Text>);
                break;
            case LineContentStyle.Italic:
                elements.push(<Text span inherit key={i} fs={'italic'}>{item.text}</Text>);
                break;
            case LineContentStyle.InlineCode:
                elements.push(<Text span inherit key={i} style={{ fontFamily: 'monospace', backgroundColor: '#24282C', padding: '2px 4px', borderRadius: '4px' }}>{item.text}</Text>);
                break;
            case LineContentStyle.Subscript:
                elements.push(<Text span inherit key={i} style={{ verticalAlign: 'sub' }}>{item.text}</Text>);
                break;
            case LineContentStyle.Superscript:
                elements.push(<Text span inherit key={i} style={{ verticalAlign: 'super' }}>{item.text}</Text>);
                break;
            case LineContentStyle.Strikethrough:
                elements.push(<Text span inherit key={i} style={{ textDecoration: 'line-through' }}>{item.text}</Text>);
                break;
            case LineContentStyle.Keyboard:
                elements.push(<Kbd key={i}>{item.text}</Kbd>);
                break;
            case LineContentStyle.Highlight:
                elements.push(<Text span inherit key={i} style={{ backgroundColor: '#77734f' }}>{item.text}</Text>);
                break;
            case LineContentStyle.Link:
                elements.push(<LinkWithPreview key={i} url={item.href!} text={item.text}></LinkWithPreview>);
                break;
            default:
                elements.push(<Text span inherit key={i}>{item.text}</Text>);
                break;
        }
    }
    return elements;
}

const LinkWithPreview = (props: {url: string, text: string}) => {

    const [url, text] = [props.url, props.text];

    const renderLinkPreview = ({ loading, preview }) => {

        const copyToClipboard = (str: string) => {
            navigator.clipboard.writeText(str);
        }


        return loading ? (
            <Text>Loading <Anchor href={url} target="_blank">{url}</Anchor>...</Text>
        ) : (
            <Flex gap='sm' align='center'>
                <Anchor href={url} target="_blank" style={{
                    display: 'block',
                    maxHeight: '25vh',
                    maxWidth: '25vh',
                    overflowY: 'auto'
                }}>
                    <Image height='100%' src={preview.img} alt={preview.title} radius='sm'/>
                </Anchor>
                <Container>
                    <Anchor href={url} target="_blank" style={{
                        display: 'block',
                        color: 'inherit'}}
                    >
                        <Flex gap='sm' align='center'>
                            <Image src={preview.favicon} alt={preview.title} style={{
                                objectFit: 'contain',
                                backgroundColor: '#ffffffdd',
                                borderRadius: '10%',
                                height: '26px',
                                width: '26px'
                            }} />
                            <Title order={4}>{preview.title}<RiArrowRightUpBoxLine style={{
                                height: '18px',
                                width: '18px',
                                flexShrink: '0',
                                marginLeft: '1ch'
                            }} /></Title>
                        </Flex>
                    </Anchor>
                    <Text>{preview.description}</Text>
                    <Divider my='sm' />
                    <Flex gap='sm' align='center' style={{
                        cursor: 'pointer'
                    }} onClick={() => copyToClipboard(url)}>
                        <RiLink style={{
                            height: '18px',
                            width: '18px',
                            flexShrink: '0'
                        }} />
                        <Text>Copy link</Text>
                    </Flex>
                </Container>
            </Flex>
        )
    }

    return (<HoverCard shadow='md' withArrow openDelay={200} closeDelay={200}>
        <HoverCard.Target>
            <Anchor href={url}>{text}</Anchor>
        </HoverCard.Target>
        <HoverCard.Dropdown>
            <Card style={{
                maxWidth: '40vw',
                maxHeight: '40vh',
                padding: '0',
                overflowY: 'auto'
            }}>
                <LinkPreview
                    url={url}
                    customDomain='https://webpreviews.mosaiq.dev/parse/link'
                    render={renderLinkPreview}
                />
            </Card>
        </HoverCard.Dropdown>
    </HoverCard>);
}

const processEmojis = (line: string)=> {
    const emojiEntries = Object.entries(Emoji)
    return line.replace((/(?<!(?:^|[^\\])(?:\\\\)*\\):([a-z0-9-_+]+):/gi), (match, keyword) => {
        for (let i = 0; i < emojiEntries.length; i++) {
            const [emoji, names] = emojiEntries[i];
            if (names.includes(keyword)) {
                return emoji
            }
        }
        return match;
    })
}

const INDENT_SPACES = '  ';
const extractLineData = (line: string): Line => {

    line = processEmojis(line);

    const lineObject: Line = {
        line,
        type: LineType.Paragraph,
        indentLevel: 0,
        content: [],
    };

    // INDENTATION
    line = line.replace(/\t/g, INDENT_SPACES);
    if (!line.startsWith(INDENT_SPACES)) {
        lineObject.indentLevel = 0;
    } else {
        lineObject.indentLevel = Math.floor(line.match(/^ +/)![0].length / INDENT_SPACES.length);
    }
    line = line.trim();

    //  FULL BLOCK FORMATTING
    if(line === '') {
        lineObject.type = LineType.LineBreak;
        return lineObject;
    } else if (line.trim() === '---') {
        lineObject.type = LineType.HorizontalRule;
        return lineObject;
    }

    // TEXT BLOCK FORMATTING
    let lineText = line;
    if (line.startsWith('#')) {
        const headingLevel = Math.min(line.match(/^#+/)![0].length, 6);
        lineObject.type = LineType.Heading;
        lineObject.headingLevel = headingLevel;
        const headingContent = line.replace(/^#+ */, '');
        lineText = headingContent;
    } else if (line.startsWith('-')) {
        lineObject.type = LineType.ListItem;
        const listContent = line.replace(/^- */, '');
        lineText = listContent;
    } else if (line.startsWith('|') && line.endsWith('|') && line.length > 2) {
        lineObject.type = LineType.Table;
        lineText = line.replace(/^|/, '').replace(/|$/, '');
    } else if (/^>+ .*/.test(line)) {
        lineObject.type = LineType.Blockquote;
        // "blockquote level" is number of unescaped opening > 's (indifferent to spaces), starting at 1
        lineObject.blockquoteLevel = line.match(/^>+/)![0].length;
        lineText = line.replace(/^>+ /, '');
    }

    // INLINE FORMATTING
    if (lineText.length < 3) {
        lineObject.content.push({
            text: lineText,
            style: LineContentStyle.Text,
        });
        return lineObject;
    }

    // no nested formatting. Styles get extracted in the prioritized order of code, then bold, then italic ... etc
    // when splitting by a token, odd indexes are inside the token, even indexes are outside the token
    const splitByDelimiter = (contents: LineContent[], delim: string, style: LineContentStyle) => {
        for (let i = 0; i < contents.length; i++) {
            if (contents[i].style !== LineContentStyle.Text) {
                continue;
            }
            // contents[i].text.split(delim);
            const delimSplit = splitStringWithEscape(contents[i].text, delim, true);
            const delimContents: LineContent[] = [];
            for (let j = 0; j < delimSplit.length; j++) {
                delimContents.push({
                    text: delimSplit[j],
                    style: (j % 2 === 0 || j === delimSplit.length - 1) ? LineContentStyle.Text : style,
                });

                // In cases where the delim in 2 chars, when it splits it will split the delim into 2 parts across 2 elements. The 2nd delim part needs to be brought back into the previous element
                const partialDelim = delim[0];
                if (delim.length === 2 && j > 0 && delimContents[j].text.startsWith(partialDelim)) {
                    delimContents[j - 1].text += delim[0];
                    delimContents[j].text = delimContents[j].text.slice(1);
                }
            }
            contents.splice(i, 1, ...delimContents);
            i += delimContents.length - 1;
        }
    }

    const FORMATTED_URL_REGEX = /(\[[^\]]+\]\(https?:\/\/[a-z0-9\-.]+\.[a-z0-9-]+(?:\/[^ \n\t)]*)?\))/gi;
    const URL_REGEX = /(https?:\/\/[a-z0-9\-.]+\.[a-z0-9-]+(?:\/[^ \n\t]*)?)/gi;

    const splitByLink = (contents: LineContent[]) => {
        const splitByThing = (regex: RegExp, makeDelimContent: (body: string) => LineContent)=> {
            for (let i = 0; i < contents.length; i++) {
                if (contents[i].style !== LineContentStyle.Text) {
                    continue;
                }
                const splitLine = contents[i].text.split(regex);
                const delimContents: LineContent[] = splitLine.map((str, index) => {
                    const isSpecial = (index % 2 == 1)
                    if (!isSpecial) {
                        return {
                            text: str,
                            style: LineContentStyle.Text
                        };
                    } else {
                        return makeDelimContent(str);
                    }
                });
                contents.splice(i, 1, ...delimContents);
                i += delimContents.length - 1;
            }
        }

        splitByThing(FORMATTED_URL_REGEX, (str) => {
            const match = str.match(/\[([^\]]+)\]\(([^)]+)\)/);
            const text = match![1];
            const href = match![2];
            return {
                text: text,
                style: LineContentStyle.Link,
                href: href
            };
        })

        splitByThing(URL_REGEX, (str) => {
            return {
                text: str,
                style: LineContentStyle.Link,
                href: str
            }
        })

    }

    const splitStringWithEscape = (line: string, delim: string, delimIsPaired: boolean): string[] => {
        const neuterSpecials = (str: string) => {
            return str.replace(/[*^|]/g, '\\$&');
        }
        const regex = new RegExp(`(?<!(?:^|[^\\\\])(?:\\\\\\\\)*\\\\)${neuterSpecials(delim)}`, 'gi');
        const splitLine = line.split(regex);
        if (delimIsPaired && splitLine.length > 1 && splitLine.length % 2 == 0) {
            const lastTwo = splitLine.slice(-2).join(delim);
            splitLine.splice(splitLine.length - 2, 2, lastTwo)
        }
        return splitLine;
    }

    const pruneBackslashes = (lines: LineContent[]) => {
        const newLines: LineContent[] = lines.map((line) => {
            // remove backslashes with
            // before: an even number (incl 0) of backslashes
            // after: after: any of `*_~^@=|\
            // UPDATE THIS LIST WHEN ADDING NEW SPECIAL CHARACTERS (THIS ONE vvv)
            return {...line, text: line.text.replace(/(?<=(?:^|[^\\])(?:\\\\)*)\\(?=[`*_~^@=|#>\-:\\])/gi, '')};
        })
        lines.splice(0, lines.length, ...newLines);
    }

    const delimiters = [
        ['`', LineContentStyle.InlineCode],
        ['**', LineContentStyle.Bold],
        ['__', LineContentStyle.Bold],
        ['*', LineContentStyle.Italic],
        ['_', LineContentStyle.Italic],
        ['~~', LineContentStyle.Strikethrough],
        ['^', LineContentStyle.Superscript],
        ['~', LineContentStyle.Subscript],
        ['@@', LineContentStyle.Keyboard],
        ['==', LineContentStyle.Highlight]
    ] as [string, LineContentStyle][];

    // if table, format each individual cell (may refactor)
    if (lineObject.type == LineType.Table) {
        const rootContentses: LineContent[][] = splitStringWithEscape(lineText, '|', false).map((td) => [{
            text: td,
            style: LineContentStyle.Text
        }]);
        const contentses = rootContentses;
        contentses.forEach((td) => {
            for (let i = 0; i < delimiters.length; i++) {
                splitByDelimiter(td, delimiters[i][0], delimiters[i][1]);
            }
        })
        contentses.forEach((c) => splitByLink(c));
        contentses.forEach((c) => pruneBackslashes(c));
        lineObject.tableContent = contentses;
    }

    const rootContents: LineContent[] = [{
        text: lineText,
        style: LineContentStyle.Text,
    }];
    const contents = rootContents;
    for (let i = 0; i < delimiters.length; i++) {
        splitByDelimiter(contents, delimiters[i][0], delimiters[i][1]);
    }
    splitByLink(contents);
    pruneBackslashes(contents);
    lineObject.content = contents;

    return lineObject;
}



enum LineType {
    Heading = 'heading',
    List = 'list',
    Blockquote = 'blockquote',
    Paragraph = 'paragraph',
    CodeBlock = 'codeBlock',
    HorizontalRule = 'horizontalRule',
    ListItem = 'listItem',
    LineBreak = 'lineBreak',
    Table = 'table'
}

enum LineContentStyle {
    Bold = 'bold',
    Italic = 'italic',
    InlineCode = 'inlineCode',
    Subscript = 'subscript',
    Superscript = 'superscript',
    Strikethrough = 'strikethrough',
    Keyboard = 'keyboard',
    Highlight = 'highlight',
    Text = 'text',
    Link = 'link'
}

interface Tab {
    heading: Line,
    content: (Line | Tabset)[]
}

interface Tabset {
    parent: Tabset | null,
    selfLevel: number,
    childLevel: number,
    tabs: Tab[]
}

interface Line {
    line: string;
    type: LineType;
    indentLevel: number;
    content: LineContent[];
    headingLevel?: number;
    tableContent?: LineContent[][];
    blockquoteLevel?: number;
}

interface LineContent {
    text: string;
    style: LineContentStyle;
    href?: string;
}