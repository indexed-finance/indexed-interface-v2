import { GraphqlService } from "services";
import { selectors } from "features";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function useEthPrice() {
  const [price, setPrice] = useState<null | number>(null);
  const blockNumber = useSelector(selectors.selectBlockNumber);

  useEffect(() => {
    GraphqlService.getEthereumPrice().then((value) => {
      if (value) {
        setPrice(value);
      }
    });
  }, [blockNumber]);

  return price;
}
