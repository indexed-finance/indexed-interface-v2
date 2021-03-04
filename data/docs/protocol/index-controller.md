# Index Pool Controller

The index pool controller is a contract which tracks token values and sets portfolio targets using an adjusted capitalization-weighted formula. The NDX governance dao has the ability to create and manage token categories on the controller, which are baskets of assets with some arbitrary commonality. 

## Category Token Selection

The current rules for inclusion in each category can be found on their respective pages on the app.

- [Decentralized Finance Category](https://indexed.finance/category/0x2)
- [Cryptocurrency Category](https://indexed.finance/category/0x1)

## Category Sorting
Token categories are regularly sorted in descending order of the tokens' market caps using a weekly moving average of the tokens' prices. Market caps are extrapolated by taking the weekly moving average price of a token returned by the Uniswap oracle and multiplying by its total supply. In the future we plan on using more advanced metrics like float-adjusted capitalization, as is used in S&P indices, to get a more accurate representation of the value of tokens' active liquidity.

## Index Token Selection
When an index is first deployed, and each month thereafter, the controller selects the top $$n$$ tokens in its category as the target portfolio assets, where $$n$$ is the index size set at deployment. The tokens must be sorted within the 24 hour period prior to the selection process. Further details can be found in the documentation regarding pool re-indexing.

## Token Weighting Algorithm
Because tokens in the DeFi ecosystem have such a wide range of market caps, we decided to use an adjusted algorithm for computing token weights. Rather than weighing assets by market cap, we weigh them by market cap square root. This algorithm still favors tokens with larger market caps but does not result in some assets having such a massively higher weight than the others that the smaller cap tokens are effectively irrelevant, which would be the case in many indices if standard market cap weighting was used.

The algorithm to compute the weight of token $$t$$ in an index with $$l$$ tokens, where $$m(T_{n})$$ is the extrapolated market cap of the $$n^{th}$$ token, is:
$$
w(t) = \frac{\sqrt{m(t)}}{\sum_{n=0}^{n < l} {\sqrt{m(T_{n})}}}
$$