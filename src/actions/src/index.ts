import { BigInt, JSON } from "@polywrap/wasm-as";
import {
  Ethereum_Module,
  Graph_Module,
  Logger_Logger_LogLevel,
  Logger_Module,
  Http_Module,
} from "./wrap";
import { Args_checker, CheckerResult } from "./wrap";
import { GelatoArgs } from "./wrap/GelatoArgs";
import { UserArgs } from "./wrap/UserArgs";

export function checker(args: Args_checker): CheckerResult {
  let userArgs = UserArgs.fromBuffer(args.userArgsBuffer);
  let gelatoArgs = GelatoArgs.fromBuffer(args.gelatoArgsBuffer);

  // let { justLesserKey , justGreaterKey } = userArgs;

  let gasPrice = gelatoArgs.gasPrice;
  let timeStamp = gelatoArgs.timeStamp;

  const highestBids = Graph_Module.querySubgraph({
    subgraphAuthor: "aroralanuk",
    subgraphName: "themis",
    query: `
    {
      projects {
        highestBids {
          id
          domain
          bidderAddress
          amount
          timestamp

        }
      }
    }`,
  }).unwrap();

  let resObj = <JSON.Obj>JSON.parse(highestBids);
  let amount = resObj.getValue("projects[0].highestBids");

  let canExec = false;
  let execData = "";

  return { canExec, execData };
}
