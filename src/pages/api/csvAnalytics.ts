import dbConnect from "@utils/db";
import Url from "@models/url";
import { Parser } from "json2csv";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await dbConnect(req, res);
    // Fetch all the URLs
    if (req.method === "GET") {
      const urls = await Url.find({});
      // Extract only the data from the _doc property (Contains the actual document data)
      const urlsData = urls.map((url) => url._doc);
      // Convert the extracted data to CSV format
      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(urlsData);

      // Set the content type for the response as CSV
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=urls.csv");
      res.status(200).send(csv);
    } else {
      res.status(405).json({ message: "Method Not Allowed" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}
