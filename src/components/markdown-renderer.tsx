"use client";

import React from "react";

interface MarkdownRendererProps {
  content: string;
}

function parseMarkdown(content: string): React.ReactNode[] {
  const lines = content.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    
    // Headers
    if (line.startsWith("### ")) {
      nodes.push(<h3 key={i} className="text-lg font-semibold mt-4 mb-2">{parseInline(line.slice(4))}</h3>);
    } else if (line.startsWith("## ")) {
      nodes.push(<h2 key={i} className="text-xl font-semibold mt-4 mb-2">{parseInline(line.slice(3))}</h2>);
    } else if (line.startsWith("# ")) {
      nodes.push(<h1 key={i} className="text-2xl font-bold mt-4 mb-2">{parseInline(line.slice(2))}</h1>);
    }
    // Code blocks
    else if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      nodes.push(
        <pre key={i} className="bg-muted p-4 rounded-lg overflow-x-auto my-3">
          <code className={`language-${lang} text-sm font-mono`}>{codeLines.join("\n")}</code>
        </pre>
      );
    }
    // Blockquotes
    else if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      i--;
      nodes.push(
        <blockquote key={i} className="border-l-4 border-primary pl-4 italic text-muted-foreground my-3">
          {quoteLines.map((ql, qi) => (
            <React.Fragment key={qi}>
              {parseInline(ql)}
              {qi < quoteLines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </blockquote>
      );
    }
    // Lists
    else if (line.match(/^[\-\*]\s/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^[\-\*]\s/)) {
        listItems.push(lines[i].slice(2));
        i++;
      }
      i--;
      nodes.push(
        <ul key={i} className="list-disc pl-6 space-y-1 my-3">
          {listItems.map((item, idx) => (
            <li key={idx}>{parseInline(item)}</li>
          ))}
        </ul>
      );
    }
    else if (line.match(/^\d+\.\s/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        listItems.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      i--;
      nodes.push(
        <ol key={i} className="list-decimal pl-6 space-y-1 my-3">
          {listItems.map((item, idx) => (
            <li key={idx}>{parseInline(item)}</li>
          ))}
        </ol>
      );
    }
    // Horizontal rule
    else if (line.trim() === "---" || line.trim() === "***") {
      nodes.push(<hr key={i} className="my-4 border-border" />);
    }
    // Paragraphs
    else if (line.trim()) {
      const paragraphLines: string[] = [line];
      i++;
      while (i < lines.length && lines[i].trim() && !lines[i].startsWith("#") && !lines[i].startsWith("```") && !lines[i].startsWith(">") && !lines[i].match(/^[\-\*]\s/) && !lines[i].match(/^\d+\.\s/)) {
        paragraphLines.push(lines[i]);
        i++;
      }
      i--;
      nodes.push(
        <p key={i} className="my-3 leading-relaxed">
          {parseInline(paragraphLines.join(" "))}
        </p>
      );
    }
    
    i++;
  }

  return nodes;
}

function parseInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  
  // Handle bold, italic, code, links, and latex
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[([^\]]+)\]\(([^)]+)\)|\$[^$\n]+\$)/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    
    const matched = match[0];
    
    if (matched.startsWith("**") && matched.endsWith("**")) {
      nodes.push(<strong key={nodes.length}>{matched.slice(2, -2)}</strong>);
    } else if (matched.startsWith("*") && matched.endsWith("*")) {
      nodes.push(<em key={nodes.length}>{matched.slice(1, -1)}</em>);
    } else if (matched.startsWith("`") && matched.endsWith("`")) {
      nodes.push(<code key={nodes.length} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{matched.slice(1, -1)}</code>);
    } else if (matched.startsWith("[") && matched.includes("](")) {
      const linkText = match[2];
      const url = match[3];
      nodes.push(<a key={nodes.length} href={url} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">{linkText}</a>);
    } else if (matched.startsWith("$") && matched.endsWith("$")) {
      nodes.push(<span key={nodes.length} className="font-mono text-sm">{matched}</span>);
    }
    
    lastIndex = match.index + matched.length;
  }
  
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  
  return nodes.length === 0 ? [text] : nodes;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      {parseMarkdown(content)}
    </div>
  );
}