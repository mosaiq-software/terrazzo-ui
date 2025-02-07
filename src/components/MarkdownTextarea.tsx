import React from 'react';
import { Box, Button, Container, Divider, Group, Kbd, Text, Textarea, Title, TitleOrder,  } from '@mantine/core';
import { CodeHighlight } from '@mantine/code-highlight';

interface MarkdownTextareaProps {
    value: string;
    onChange(value: string): void;
}


const exampleCode = `
// VisuallyHidden component source code

import {
  Box,
  BoxProps,
  StylesApiProps,
  factory,
  ElementProps,
  useProps,
  useStyles,
  Factory,
} from '../../core';
import classes from './VisuallyHidden.module.css';

export type VisuallyHiddenStylesNames = 'root';

export interface VisuallyHiddenProps
  extends BoxProps,
    StylesApiProps<VisuallyHiddenFactory>,
    ElementProps<'div'> {}

export type VisuallyHiddenFactory = Factory<{
  props: VisuallyHiddenProps;
  ref: HTMLDivElement;
  stylesNames: VisuallyHiddenStylesNames;
}>;

const defaultProps: Partial<VisuallyHiddenProps> = {};

export const VisuallyHidden = factory<VisuallyHiddenFactory>((_props, ref) => {
  const props = useProps('VisuallyHidden', defaultProps, _props);
  const { classNames, className, style, styles, unstyled, vars, ...others } = props;

  const getStyles = useStyles<VisuallyHiddenFactory>({
    name: 'VisuallyHidden',
    classes,
    props,
    className,
    style,
    classNames,
    styles,
    unstyled,
  });

  return <Box component="span" ref={ref} {...getStyles('root')} {...others} />;
});

VisuallyHidden.classes = classes;
VisuallyHidden.displayName = '@mantine/core/VisuallyHidden';
`;

export const MarkdownTextarea = (props:MarkdownTextareaProps) => {
    const [editing, setEditing] = React.useState(false);
    const [editedValue, setEditedValue] = React.useState(props.value);

    const onCancelEdit = () => {
        setEditing(false);
        setEditedValue(props.value);
    }

    const onSaveEdit = () => {
        setEditing(false);
        props.onChange(editedValue);
    }

    if (editing) {
        return (
            <Container>
                <Textarea
                    value={editedValue}
                    onChange={(event) => setEditedValue(event.currentTarget.value)}
                    autosize
                    minRows={10}
                    maxRows={30}
                />
                <Group>
                    <Button variant='outline' onClick={onCancelEdit}>Cancel</Button>
                    <Button variant='light' onClick={onSaveEdit}>Save</Button>
                </Group>
            </Container>
        );
    }

    return (
        <Container onClick={() => setEditing(true)} style={{ cursor: 'text' }}>
            {renderMarkdown(props.value)}
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
        // LineType.X BASED ON INITIAL CHARACTERS IN LINE I.E: #, -, ---, "", ...
        switch (line.type) {
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
            case LineType.CodeBlock:
                elements.push(
                        <Box>
                            <CodeHighlight
                              code={exampleCode}
                              key={i}
                              language='tsx'
                              copyLabel="Copy button code"
                              copiedLabel="Copied!"
                            //   mt="md"
                              />

                        </Box>




                );
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


// add code block style
//  1. import from mantine
//  2. add to switch statement in renderLineContentStyle with mantine code block component
//  3. add to delimiter array
//
//
//  detect ``` count how many lines till ```
//
//
//
//
// //


const renderLineContent = (content: LineContent[]): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    for (let i = 0; i < content.length; i++) {
        console.log(content[i]);
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
            // case LineContentStyle.InlineCode:
            //     elements.push(<Text span inherit key={i} style={{ fontFamily: 'monospace', backgroundColor: '#f5f5f5', padding: '2px 4px', borderRadius: '4px' }}>{item.text}</Text>);
            //     break;
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
        console.log(lineObject)
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
    } else if (line.startsWith('```')) {
        lineObject.type = LineType.CodeBlock;
        const codeContent = line.replace(/^``` */, '');
        // need to determine how many lines the code block is and add that many lines to the code block
            // for loop through lines till you find another ``` and add those lines to the code block
            // counter for lines staring at 0, when you find another ``` break and add those lines to the code block
        // need to determine language of code block, after first ``` user needs to type language i.e ```js, ```python, ```tsx
        // below is the format you will need to to set the line text
//  if (lineText.length < 3) {
//     lineObject.content.push({
//         text: lineText,
//         style: LineContentStyle.Text,
//     });
//     return lineObject;
// }


        // this just works on one line right now:
        lineText = codeContent;
        // return lineObject;
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

    const rootContents: LineContent[] = [{
        text: lineText,
        style: LineContentStyle.Text,
    }];
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
    let contents = rootContents;
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
}

interface LineContent {
    text: string;
    style: LineContentStyle;
}
