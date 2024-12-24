import { Builder, Parser } from "xml2js";

const parseStringToXml = async (xml: string): Promise<any> => {
  const parser = new Parser();
  return parser.parseStringPromise(xml);
};

const parseObjectToXmlString = async (object: any): Promise<string> => {
  const builder = new Builder({
    renderOpts: { pretty: true },
  });
  return builder.buildObject(object);
};

export { parseStringToXml, parseObjectToXmlString };
