import React from 'react';
import { Button, Container, ContainerProps, Divider, Group, Kbd, Text, Textarea, Title, TitleOrder, Table, Blockquote } from '@mantine/core';

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

const renderMarkdown = (markdown: string): JSX.Element[] => {
    const rawLines = markdown.split('\n');
    const lines: Line[] = rawLines.map((line) => {
        return extractLineData(line);
    });

    const elements: JSX.Element[] = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        switch (line.type) {
            case LineType.Blockquote: {
                const blockquoteLines: Line[] = nextLinesOfType(lines, LineType.Blockquote, i);
                i += blockquoteLines.length - 1;
                elements.push(processBlockquotes(blockquoteLines, i));
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
                    <Table key={i}>
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
                    <Title key={i} style={{ marginLeft: `${line.indentLevel * 20}px`}} order={line.headingLevel as TitleOrder}>
                        {renderLineContent(line.content)}
                    </Title>
                );
                break;
            case LineType.ListItem:
                elements.push(
                    <Text key={i} style={{ marginLeft: `${line.indentLevel * 20}px`}}>
                        <Text span fw={700}>•</Text> {renderLineContent(line.content)}
                    </Text>
                );
                break;
            case LineType.HorizontalRule:
                elements.push(<Divider key={i} />);
                break;
            case LineType.LineBreak:
                elements.push(<br key={i} />);
                break;
            case LineType.Paragraph:
            default:
                elements.push(
                    <Text key={i} style={{ marginLeft: `${line.indentLevel * 20}px`}}>
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
                elements.push(<Text span inherit key={i} style={{ fontFamily: 'monospace', backgroundColor: '#f5f5f5', padding: '2px 4px', borderRadius: '4px' }}>{item.text}</Text>);
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
            default:
                elements.push(<Text span inherit key={i}>{item.text}</Text>);
                break;
        }
    }
    return elements;
}

const INDENT_SPACES = '  ';
const extractLineData = (line: string): Line => {
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
            const delimSplit = contents[i].text.split(delim);
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
    ] as [string, LineContentStyle][];

    // if table, format each individual cell (may refactor)
    if (lineObject.type == LineType.Table) {
        const rootContentses: LineContent[][] = lineText.split('|').map((td) => [{
            text: td,
            style: LineContentStyle.Text
        }]);
        const contentses = rootContentses;
        contentses.forEach((td) => {
            for (let i = 0; i < delimiters.length; i++) {
                splitByDelimiter(td, delimiters[i][0], delimiters[i][1]);
            }
        })
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
    Text = 'text',
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
}