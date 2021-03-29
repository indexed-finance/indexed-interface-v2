import { Divider, Menu } from "antd";
import {
  LanguageSelector,
  ModeSwitch,
  ServerConnection,
  Token,
} from "components";
import { Link, useHistory } from "react-router-dom";
import { SOCIAL_MEDIA } from "config";
import { TranslatedTerm, useTranslation } from "i18n";
import { selectors } from "features";
import { useBreakpoints, useScrollPrevention } from "helpers";
import { useSelector } from "react-redux";
import noop from "lodash.noop";
import routes from "./routes";

interface Props {
  className?: string;
  onItemClick?(): void;
}

const { Item, SubMenu } = Menu;

export default function AppMenu({ onItemClick = noop, ...rest }: Props) {
  const tx = useTranslation();
  const menuModels = useSelector(selectors.selectMenuModels);
  const categoryLookup = useSelector(selectors.selectCategoryLookup);
  const indexPoolsLookup = useSelector(selectors.selectCategoryImagesByPoolIds);
  const history = useHistory();
  const { isMobile } = useBreakpoints();

  useScrollPrevention(isMobile);

  return (
    <>
      {!isMobile && (
        <Divider style={{ marginTop: 0, marginBottom: 0 }} dashed={true} />
      )}
      <Menu
        className="AppMenu"
        mode="inline"
        defaultOpenKeys={["Social"]}
        selectable={false}
        {...rest}
      >
        {isMobile ? (
          <>
            <Item>
              <div className="perfectly-centered">
                <ServerConnection showText={true} />
              </div>
            </Item>
            <Item>
              <div className="spaced-between">
                <ModeSwitch />
                <LanguageSelector />
              </div>
            </Item>
          </>
        ) : (
          <Item>
            <div className="spaced-between">
              <ServerConnection showText={true} />
              <ModeSwitch />
            </div>
          </Item>
        )}
        {routes
          .filter((route) => route.sider)
          .map((route) => {
            if (route.model) {
              const models =
                menuModels[route.model as "categories" | "indexPools"];
              const sider =
                typeof route.sider === "string"
                  ? tx(route.sider as TranslatedTerm)
                  : route.sider;

              return (
                <SubMenu key={route.path} title={sider}>
                  <Item style={{ textAlign: "right" }}>
                    <Link to={route.path}>{tx("VIEW_ALL")}</Link>
                  </Item>
                  <Menu.Divider />
                  {models.map((model) => {
                    const isIndexPool = route.model === "indexPools";
                    const image = isIndexPool
                      ? indexPoolsLookup[model.id]
                      : categoryLookup[model.id]?.symbol ?? "";

                    return (
                      <Item
                        key={model.id}
                        onClick={() => {
                          history.push(`${route.path}/${model.slug}`);
                          onItemClick();
                        }}
                      >
                        <div>
                          <Token
                            name={model.name}
                            image={image}
                            address={model.id}
                            margin={10}
                          />
                          {model.name}
                        </div>
                      </Item>
                    );
                  })}
                </SubMenu>
              );
            } else {
              const sider =
                typeof route.sider === "string"
                  ? tx(route.sider as TranslatedTerm)
                  : route.sider;

              return (
                <Item key={route.path} onClick={onItemClick}>
                  {route.isExternalLink ? (
                    sider
                  ) : (
                    <Link to={route.path}>
                      <span>{sider}</span>
                      {route.icon ?? null}
                    </Link>
                  )}
                </Item>
              );
            }
          })}
        {/* Static */}
        <SubMenu key="Social" title="Social">
          {SOCIAL_MEDIA.map((site) => (
            <Menu.Item key={site.name}>
              <a href={site.link} target="_blank" rel="noopener noreferrer">
                <Token name={site.name} image={site.image} />
                <span className="social-link">{site.name}</span>
              </a>
            </Menu.Item>
          ))}
        </SubMenu>
      </Menu>
    </>
  );
}
