import { Button, ScreenHeader } from "components";
import { Col, List, Row, Typography } from "antd";
import { Link } from "react-router-dom";
import React from "react";
import ReactMarkdown from "react-markdown";
import S from "string";
import data from "data.json";
import styled from "styled-components";

export default function NewsList() {
  const articlePaths = Object.keys(data).filter((key) =>
    key.startsWith("news/")
  );
  const articles = articlePaths
    .map((slug) => slug.replace(/news\//g, ""))
    .map((slug) => S(slug).humanize().s);

  return (
    <>
      <ScreenHeader title="News" />

      <Row>
        <Col xs={24} sm={10}>
          <List>
            {articlePaths.map((path, index) => {
              const title = articles[index];
              const slicedTitle = `${title.slice(0, 20)}...`;
              const brief = (data as any)[path];
              const slicedBrief = `${brief.slice(0, 100)}...`;

              return (
                <List.Item key={path}>
                  <List.Item.Meta
                    title={
                      <T.Spaced>
                        <T.Title level={2}>
                          {title.length > 20 ? slicedTitle : title}
                        </T.Title>
                        <Link to={path}>
                          <Button type="primary">Read</Button>
                        </Link>
                      </T.Spaced>
                    }
                    description={
                      <ReactMarkdown>
                        {brief.length > 100 ? slicedBrief : brief}
                      </ReactMarkdown>
                    }
                  />
                </List.Item>
              );
            })}
          </List>
        </Col>
      </Row>
    </>
  );
}

const T = {
  Spaced: styled.div`
    ${(props) => props.theme.snippets.spacedBetween};
    width: 100%;
  `,
  Title: styled(Typography.Title)`
    margin-bottom: 0 !important;
  `,
};
