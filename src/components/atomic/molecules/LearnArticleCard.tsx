import { Card } from "antd";
import { useHistory } from "react-router-dom";
import { useMarkdownData } from "hooks";
import Markdown from "react-markdown";

interface Props {
  file: string;
}

export function LearnArticleCard(props: Props) {
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
