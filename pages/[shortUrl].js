import dbConnect from "../utils/db";
import Url from "../models/url";
import { SpeedInsights } from "@vercel/speed-insights/next";

import axios from "axios";
const getCountryByIp = async (ip) => {
  console.log("IP", ip);
  try {
    const response = await axios.get(`http://ip-api.com/json/${ip}`);
    // console.log(response);
    return response.country || "Unknown";
  } catch (error) {
    console.error("Error fetching country:", error);
    return "Unknown";
  }
};

export async function getServerSideProps(context) {
  const { shortUrl } = context.params;
  const { req } = context;
  await dbConnect();

  try {
    // Query
    const urlDocument = await Url.findOne({ shortenUrl: shortUrl });
    if (urlDocument) {
      if (urlDocument.isActive == false) {
        console.log("URL is not active");
        return {
          notFound: true,
          // redirect: {
          //   destination: '/waiting',
          //   permanent: false,
          // }
        };
      }
      const forwarded = req.headers["x-forwarded-for"];
      console.log("Forwarded IP:", forwarded);
      let clientIp = forwarded
        ? forwarded.split(",")[0].trim()
        : req.socket.remoteAddress;
      if (clientIp.startsWith("::ffff:")) {
        clientIp = clientIp.slice(7); // Remove the IPv6 prefix
      }
      const currentTime = new Date();
      const userAgent = req.headers["user-agent"] || "Unknown";
      const referrer = req.headers["referer"] || "Direct";
      const country = await getCountryByIp(clientIp);
      await Url.updateOne(
        { shortenUrl: shortUrl },
        {
          $inc: { "accesses.count": 1 },
          $push: {
            "accesses.lastAccessed": {
              $each: [
                {
                  date: currentTime,
                  userAgent: userAgent,
                  referrer: referrer,
                  country: country,
                },
              ],
              $slice: -100,
            },
          },
        },
        { upsert: true }
      );

      let originalUrl = urlDocument.originalUrl;
      if (!/^https?:\/\//i.test(originalUrl)) {
        originalUrl = `https://${originalUrl}`; // Prepend https:// if missing
      }

      return {
        redirect: {
          destination: originalUrl,
          permanent: false,
        },
      };
    } else {
      // If no matching shortened URL
      return {
        notFound: true,
      };
    }
  } catch (error) {
    console.error("Error fetching the shortened:", error);
    return {
      notFound: true,
    };
  }
}

const ShortUrlRedirect = () => {
  return <p>.</p>;
};

export default ShortUrlRedirect;
