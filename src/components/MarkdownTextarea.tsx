import React from 'react';
import { Button, Container, ContainerProps, Divider, Group, Kbd, Text, Textarea, Title, TitleOrder, Table, TableData } from '@mantine/core';

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

const renderMarkdown = (markdown: string): JSX.Element[] => {
    const rawLines = markdown.split('\n');
    const lines: Line[] = rawLines.map((line) => {
        return extractLineData(line);
    });

    const elements: JSX.Element[] = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        switch (line.type) {
            case LineType.Table: {
                const tableLines: Line[] = [line];
                for (; i < lines.length && lines[i].type == LineType.Table; i++) {
                    tableLines.push(lines[i])
                }
                if (i < lines.length && lines[i].type != LineType.Table) {
                    i--;
                }
                const tableContents = tableLines
                    .filter((line, id) => !(id == 1 && /[-|]+/.test(line.line)))
                    .map((x) => x.tableContent!)
                const tableHeader = tableContents[0];
                const tableBody = tableContents.filter((row, id) => id > 0);
                elements.push(
                    <Table key={i}>
                        <Table.Thead>
                            <Table.Tr>
                                {tableHeader.map((cell, cellID) => <Table.Th
                                    key={cellID}>{renderLineContent(cell)}</Table.Th>)}
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {tableBody.map((row, rowID) => <Table.Tr key={rowID}>
                                {row.map((cell, cellID) => <Table.Td key={cellID}>{renderLineContent(cell)}</Table.Td>)}
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
}

interface LineContent {
    text: string;
    style: LineContentStyle;
}