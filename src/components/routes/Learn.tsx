import {
  Button,
  Card,
  Col,
  Divider,
  Input,
  Row,
  Space,
  Typography,
} from "antd";
import { Label } from "components/common";
import { Page } from "components/layout";
import { openDataPullRequest } from "helpers";
import { useCallback, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import articles from "data/learn";

import { useHistory } from "react-router-dom";
import { useMarkdownData } from "hooks";
import Markdown from "react-markdown";

export default function Learn() {
  const [editing /*, setEditing*/] = useState(true);
  const [author, setAuthor] = useState("");
  const [video, setVideo] = useState("");
  const [avatar, setAvatar] = useState("");
  const [blurb, setBlurb] = useState("");
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const handleSubmit = useCallback(() => {
    const result = formatMarkdown({
      author,
      video,
      avatar,
      blurb,
      slug,
      title,
      content,
    });

    openDataPullRequest(title, slug, result);
  }, [author, video, avatar, blurb, slug, title, content]);

  return (
    <Page
      hasPageHeader={true}
      title="Learn"
      extra={
        <Typography.Text type="secondary">
          Showing {articles.length} of {articles.length} articles
        </Typography.Text>
      }
    >
      <Row gutter={24}>
        {articles.map((article) => (
          <Col key={article} xs={12} md={8} style={{ marginBottom: 24 }}>
            <LearnArticleCard file={article.replace(/\.md/g, "")} />
          </Col>
        ))}
      </Row>

      {editing && (
        <>
          <Divider />
          <Space
            direction="vertical"
            style={{ width: "100%", marginBottom: 24 }}
          >
            <Typography.Title level={2}>Editing</Typography.Title>
            <Card>
              <Label>Author</Label>
              <Input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </Card>
            <Card>
              <Label>Video</Label>
              <Input
                type="text"
                value={video}
                onChange={(e) => setVideo(e.target.value)}
              />
            </Card>
            <Card>
              <Label>Avatar</Label>
              <Input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
              />
            </Card>
            <Card>
              <Label>Slug</Label>
              <Input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </Card>
            <Card>
              <Label>Blurb</Label>
              <Input
                type="text"
                value={blurb}
                onChange={(e) => setBlurb(e.target.value)}
              />
            </Card>
            <Card>
              <Label>Title</Label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Card>
            <Card>
              <Label>Content</Label>
              <MDEditor
                value={content}
                onChange={(newValue) => setContent(newValue ?? "")}
              />
            </Card>
          </Space>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <Button size="large" type="primary" onClick={handleSubmit}>
              Publish
            </Button>
          </div>
        </>
      )}
    </Page>
  );
}

interface LearnArticleCardProps {
  file: string;
}

function LearnArticleCard(props: LearnArticleCardProps) {
  const { avatar, blurb, title, slug } = useMarkdownData(props.file);
  const history = useHistory();

  return (
    <Card
      bordered={true}
      hoverable={true}
      onClick={() => history.push(`/learn/${slug}`)}
    >
      <Card.Meta
        avatar={<img alt={title} src={`/data/learn/${avatar}.png`} />}
        title={title}
        description={<Markdown>{blurb}</Markdown>}
      />
    </Card>
  );
}

// #region Helpers

// ---
// - avatar: sample
// - slug: burn
// - title: How To Burn
// - blurb: Blah
// ---

// # Sample C

// ## This is the third sample.

function formatMarkdown({
  author,
  video,
  avatar,
  blurb,
  slug,
  title,
  content,
}: Record<string, string>) {
  const lines = ["---  \n"];

  [author, video, avatar, blurb, slug, title].forEach((metadata) =>
    lines.push(`- ${metadata}  \n`)
  );

  lines.push("---  \n");

  return `${lines.join("")}\n${content}`;
}
// #endregion
