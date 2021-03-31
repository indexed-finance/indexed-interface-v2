import { ETHEREUM_PRICE_URL, SUBGRAPH_URL_INDEXED } from "config";
import { IpfsService } from "./ipfs";
import { convert } from "helpers";
import axios from "axios";

export class GraphqlService {
  public static executeRequest = (
    query: string,
    url: string = SUBGRAPH_URL_INDEXED
  ) => axios.post(url, { query });

  public static getTokenCategories = async (): Promise<
    Array<{
      id: string;
      tokens: Array<{
        id: string;
        name: string;
        symbol: string;
        priceUSD: string;
      }>;
    }>
  > => {
    const {
      data: { categories },
    } = await GraphqlService.executeRequest(categoriesQuery);

    return categories;
  };

  public static getCategoryMetadata = async (id: number) => {
    const {
      data: { category },
    } = await GraphqlService.executeRequest(categoryMetadataQuery(id));

    return IpfsService.getIPFSFile(category.metadataHash);
  };

  public static getEthereumPrice = async () => {
    const {
      data: { pairs },
    } = await GraphqlService.executeRequest(priceQuery, ETHEREUM_PRICE_URL);

    if (pairs) {
      const [{ token0Price: price }] = pairs;

      return convert.toBigNumber(price).toNumber();
    }
  };
}

// #region Queries
const categoryMetadataQuery = (id: number) => `
{
category(id: "0x${id.toString(16)}") {
  metadataHash
}
}
`;

const categoriesQuery = `
{
  categories {
    id
    metadataHash
    tokens {
      id
      symbol
      priceUSD
      name
    }
    indexPools {
      id
      size
      totalSupply
    }
  }
}`;

const priceQuery = `
{
  pairs(where: { id: "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc"}) {
    token0Price
  }
}`;
// #endregion
