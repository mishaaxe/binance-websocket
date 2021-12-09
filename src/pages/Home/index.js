import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";

import { Header, Loading } from "../../components";
import DataTable from "./DataTable";

const Home = (props) => {
  const { market_pairs, active_market, filtered_pairs } = props;
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const ws = useRef(null);

  useEffect(() => {
    _connectSocketStreams(["!ticker@arr"]);

    return () => {
      _disconnectSocketStreams(["!ticker@arr"]);
    };
  }, []);

  const _getTickerBySymbol = (data) => {
    let ticker = {};

    data.forEach((item) => {
      let symbol = item.symbol || item.s;
      ticker[symbol] = {
        symbol: symbol,
        lastPrice: item.lastPrice || item.c,
        priceChange: item.priceChange || item.p,
        priceChangePercent: item.priceChangePercent || item.P,
        highPrice: item.highPrice || item.h,
        lowPrice: item.lowPrice || item.l,
        quoteVolume: item.quoteVolume || item.q,
      };
    });

    return ticker;
  };

  const setActiveMarket = (market) => {
    props.dispatch({
      type: "SET_ACTIVE_MARKET",
      data: market,
    });
  };
  
  const _connectSocketStreams = (streams) => {
    streams = streams.join("/");
    ws.current = new WebSocket(
      `wss://stream.binance.com:9443/stream?streams=${streams}`
    );
    ws.current.onmessage = (evt) => {
      let ticker = _getTickerBySymbol(JSON.parse(evt.data).data);

      props.dispatch({
        type: "UPDATE_MARKET_PAIRS",
        data: ticker,
      });

      setIsLoaded(true);
      setError(null);
    };
    ws.current.onerror = (evt) => {
      console.error(evt);
      setError(evt);
    };
  };

  const _disconnectSocketStreams = (streams) => {
    streams = streams.join("/");
    if (ws.current.readyState === WebSocket.OPEN) {
      ws.current.close();
    }
  };

  if (!isLoaded) {
    return <Loading />;
  }

  if (error) {
    return <div className="alert alert-danger">{error.message}</div>;
  }

  return (
    <>
      <Header />
      <main role="main">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <ul className="nav nav-tabs pt-2">
                <li className="nav-item">
                  <a
                    className={
                      active_market === "BNB" ? "nav-link active" : "nav-link"
                    }
                    onClick={() => setActiveMarket("BNB")}
                  >
                    BNB<span className="d-none d-sm-inline"> Markets</span>
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={
                      active_market === "BTC" ? "nav-link active" : "nav-link"
                    }
                    onClick={() => setActiveMarket("BTC")}
                  >
                    BTC<span className="d-none d-sm-inline"> Markets</span>
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={
                      active_market === "ETH" ? "nav-link active" : "nav-link"
                    }
                    onClick={() => setActiveMarket("ETH")}
                  >
                    ETH<span className="d-none d-sm-inline"> Markets</span>
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={
                      active_market === "USDT" ? "nav-link active" : "nav-link"
                    }
                    onClick={() => setActiveMarket("USDT")}
                    data-tab="USDT"
                  >
                    USDT<span className="d-none d-sm-inline"> Markets</span>
                  </a>
                </li>
              </ul>
              {market_pairs && filtered_pairs ? (
                <DataTable ticker={market_pairs} filter={filtered_pairs} />
              ) : (
                <Loading />
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default connect((state) => state)(Home);
