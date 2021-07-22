import { SOCIAL_MEDIA } from "config";
import { Space } from "antd";
import { Token } from "components/atomic/atoms";

export function SocialMediaList() {
  return (
    <Space>
      {SOCIAL_MEDIA.map((site) => (
        <a
          key={site.name}
          href={site.link}
          target="_blank"
          rel="noopener noreferrer"
          style={{ marginBottom: 6 }}
        >
          <Token
            name={site.name}
            symbol={site.name}
            asAvatar={true}
            size="medium"
          />
        </a>
      ))}
    </Space>
  );
}
