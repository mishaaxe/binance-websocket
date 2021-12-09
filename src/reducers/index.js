const reducer = (
  state = {
    active_market: "BNB",
    market_pairs: {},
    filtered_pairs: [],
  },
  action
) => {
  switch (action.type) {
    case "UPDATE_MARKET_PAIRS":
      return {
        ...state,
        market_pairs: action.data,
        filtered_pairs: Object.keys(action.data).filter((item) =>
          item.endsWith(state.active_market)
        ),
      };
    case "SET_ACTIVE_MARKET":
      return {
        ...state,
        active_market: action.data,
      };
    default:
      return state;
  }
};

export default reducer;
