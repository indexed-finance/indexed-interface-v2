import { useEffect, useState } from "react";

export function useMarkdownData(file: string) {
  const [blurb, setBlurb] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [avatar, setAvatar] = useState("");
  const [slug, setSlug] = useState("");

  useEffect(() => {
    fetch(require(`data/learn/${file}.md`).default)
      .then((res) => res.text())
      .then((value) => value.split("export default ").join(""))
      .then((result) => {
        const parsed = parseMarkdown(result);

        setBlurb(parsed.blurb);
        setTitle(parsed.title);
        setContent(parsed.content);
        setAvatar(parsed.avatar);
        setSlug(parsed.slug);
      });
  }, [file]);

  return { blurb, title, content, avatar, slug };
}

// #region Helpers
function parseMarkdown(raw: string) {
  const metadata = raw
    .split("---\\n\\n")[0]
    .split("---\\n")
    .map((x) => x.replace(/\\n/g, ""))
    .join("")
    .split("- ")
    .slice(1)
    .reduce((prev, next) => {
      const [key, value] = next.split(": ");

      prev[key] = value;

      return prev;
    }, {} as Record<string, string>);

  const content = raw
    .split("---\\n\\n")[1]
    .replace(/";/g, "")
    .replace(/\\n/g, "  \n");

  return {
    blurb: metadata.blurb ?? "",
    title: metadata.title,
    content,
    avatar: metadata.avatar,
    slug: metadata.slug,
  };
}

// #endregion
