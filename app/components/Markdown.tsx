"use client";

import React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { Lightbox } from "./Lightbox";

interface MarkdownProps {
  content: string;
  className?: string;
  truncate?: boolean;
  truncateLength?: number;
  truncateBy?: "words" | "characters";
  onReadMore?: () => void;
  components?: Record<string, React.ComponentType<any>>;
  lightboxEnabled?: boolean;
}

function truncateText(
  text: string,
  length: number,
  by: "words" | "characters" = "words"
): { truncated: string; isTruncated: boolean } {
  if (by === "characters") {
    const isTruncated = text.length > length;
    return {
      truncated: isTruncated ? text.slice(0, length) + "..." : text,
      isTruncated,
    };
  }

  // Truncate by words while preserving all whitespace patterns
  // Match sequences of non-whitespace (words) and capture everything between them
  const wordRegex = /\S+/g;
  const words: RegExpExecArray[] = [];
  let match: RegExpExecArray | null;

  while ((match = wordRegex.exec(text)) !== null) {
    words.push(match);
    if (words.length >= length) {
      // We have enough words, truncate here
      const lastWordEnd = match.index + match[0].length;
      return {
        truncated: text.slice(0, lastWordEnd) + "...",
        isTruncated: true,
      };
    }
  }

  // Text has fewer words than the limit
  return {
    truncated: text,
    isTruncated: false,
  };
}

export function Markdown({
  content,
  className = "",
  truncate = false,
  truncateLength = 50,
  truncateBy = "words",
  onReadMore,
  components = {},
  lightboxEnabled = false,
}: MarkdownProps) {
  // Convert straight quotes to curly quotes
  const processedContent = content
    .replace(/"([^"]*)"/g, '"$1"') // Replace "quoted text" with curly quotes
    .replace(/'([^']*)'/g, "'$1'"); // Replace 'quoted text' with curly single quotes

  const { truncated: displayContent, isTruncated } = truncate
    ? truncateText(processedContent, truncateLength, truncateBy)
    : { truncated: processedContent, isTruncated: false };

  const defaultComponents: Components = {
    // Paragraphs with proper spacing
    p: (props) => <p className="mb-4 last:mb-0">{props.children}</p>,
    // Headers with appropriate sizing
    h1: (props) => (
      <h1 className="mt-6 mb-4 text-2xl font-bold first:mt-0">
        {props.children}
      </h1>
    ),
    h2: (props) => (
      <h2 className="mt-5 mb-3 text-xl font-bold first:mt-0">
        {props.children}
      </h2>
    ),
    h3: (props) => (
      <h3 className="mt-4 mb-2 text-lg font-bold first:mt-0">
        {props.children}
      </h3>
    ),
    h4: (props) => (
      <h4 className="mt-3 mb-2 text-base font-bold first:mt-0">
        {props.children}
      </h4>
    ),
    // Lists with proper indentation
    ul: (props) => (
      <ul className="mb-4 list-disc space-y-1 pl-6">{props.children}</ul>
    ),
    ol: (props) => (
      <ol className="mb-4 list-decimal space-y-1 pl-6">{props.children}</ol>
    ),
    li: (props) => <li className="leading-relaxed">{props.children}</li>,
    // Links with styling
    a: (props) => (
      <a
        {...props}
        target={props.target ?? "_blank"}
        rel={props.rel ?? "noopener noreferrer"}
        className={cn(
          "underline transition-opacity hover:opacity-70",
          props.className
        )}
      />
    ),
    // Code blocks
    pre: (props) => (
      <pre className="mb-4 overflow-x-auto rounded bg-gray-100 p-3 dark:bg-gray-800">
        {props.children}
      </pre>
    ),
    code: (props) => (
      <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800">
        {props.children}
      </code>
    ),
    // Blockquotes with curly quotes - inline style without border
    blockquote: (props) => {
      // The children will be a <p> element from the markdown parser
      // We need to extract its content and render it inline
      const childArray = React.Children.toArray(props.children);
      const content = childArray.map((child) => {
        if (
          React.isValidElement<{ children?: React.ReactNode }>(child) &&
          child.type === "p"
        ) {
          // Return just the content of the p tag, not the p tag itself
          return child.props.children;
        }
        return child;
      });

      return <span className="italic">&lquot;{content}&rquot;</span>;
    },
    // Horizontal rules
    hr: () => <hr className="my-6 border-gray-300 dark:border-gray-700" />,
    // Strong and emphasis
    strong: (props) => <strong className="font-bold">{props.children}</strong>,
    em: (props) => <em className="italic">{props.children}</em>,
    // Tables (GitHub-flavored markdown)
    table: (props) => (
      <div className="mb-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
          {props.children}
        </table>
      </div>
    ),
    thead: (props) => (
      <thead className="bg-gray-50 dark:bg-gray-800">{props.children}</thead>
    ),
    tbody: (props) => (
      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
        {props.children}
      </tbody>
    ),
    tr: (props) => <tr>{props.children}</tr>,
    th: (props) => (
      <th className="px-3 py-2 text-left text-sm font-semibold">
        {props.children}
      </th>
    ),
    td: (props) => <td className="px-3 py-2 text-sm">{props.children}</td>,
    // Images with responsive sizing
    img: (props) => {
      const image = (
        <img
          src={props.src ?? ""}
          alt={props.alt ?? ""}
          className={cn(
            "h-auto max-w-full rounded",
            !lightboxEnabled && "my-4",
            lightboxEnabled && "cursor-pointer",
            props.className
          )}
        />
      );
      if (lightboxEnabled) {
        return (
          <Lightbox
            title={props.alt ?? ""}
            className="appearance-none whitespace-pre-wrap"
            lightboxContent={
              <img
                src={props.src ?? ""}
                alt={props.alt ?? ""}
                className="h-auto max-h-full max-w-full object-contain"
              />
            }
          >
            {image}
          </Lightbox>
        );
      }
      return image;
    },
  };

  const mergedComponents = { ...defaultComponents, ...components };

  return (
    <div className={cn("prose prose-black max-w-none", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mergedComponents}>
        {displayContent}
      </ReactMarkdown>
      {isTruncated && onReadMore && (
        <button
          onClick={onReadMore}
          className="ml-1 inline-block cursor-pointer font-medium underline"
        >
          Read More
        </button>
      )}
    </div>
  );
}

// Export a variant specifically for preserving whitespace (like the original paragraph)
export function MarkdownParagraph({
  content,
  className = "",
  truncate = false,
  truncateLength = 50,
  truncateBy = "words",
  onReadMore,
  lightboxEnabled = false,
}: Omit<MarkdownProps, "components">) {
  // We want to parse markdown but preserve whitespace
  return (
    <Markdown
      content={content}
      className={cn("whitespace-pre-wrap", className)}
      truncate={truncate}
      truncateLength={truncateLength}
      truncateBy={truncateBy}
      onReadMore={onReadMore}
      lightboxEnabled={lightboxEnabled}
      components={{
        // Override paragraph to preserve whitespace and paragraph breaks
        p: ({ children }: { children: React.ReactNode }) => (
          <p className="whitespace-pre-wrap">{children}</p>
        ),
        // Blockquotes with curly quotes - inline for reviews
        blockquote: (props) => {
          // Extract text content from nested elements
          const extractText = (node: React.ReactNode): string => {
            if (typeof node === "string") {
              return node;
            }
            if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
              const childArray = React.Children.toArray(node.props.children);
              return childArray.map((child) => extractText(child)).join("");
            }
            if (Array.isArray(node)) {
              return node.map((child) => extractText(child)).join("");
            }
            return "";
          };

          const textContent = extractText(props.children).trim();

          return <span className="italic">&ldquo;{textContent}&rdquo;</span>;
        },
        // Ensure emphasis and strong work properly
        em: (props) => <em className="italic">{props.children}</em>,
        strong: (props) => (
          <strong className="font-bold">{props.children}</strong>
        ),
      }}
    />
  );
}
