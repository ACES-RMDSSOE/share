import { useRouter } from "next/router";
import { useRef, useState, useEffect } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import {
  ChartArea,
  Check,
  Copy,
  Github,
  HomeIcon,
  Share,
  LinkIcon,
  Trash2Icon,
  SearchIcon,
  Command,
  ImageDown,
} from "lucide-react";
import Head from "next/head";

import { Nav } from "../components/nav";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import SearchUrls from "@components/searchURL";
import { GradientTop } from "@components/gradientTop";

export default function Home() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [alias, setCustomAlias] = useState("");
  const [shortenUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [clickedButton, setClickedButton] = useState(null);
  const qrCodeRef = useRef(null);

  const [expirationDate, setExpirationDate] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const cookies = document.cookie.split("; ");
    const authCookie = cookies.find((cookie) =>
      cookie.startsWith("authenticated=")
    );

    if (authCookie && authCookie.split("=")[1] === "true") {
      setAuthenticated(true);
    } else {
      router.push("/");
    }
  }, [router]);

  if (!authenticated) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setShortUrl("");

    const formattedUrl =
      originalUrl.startsWith("http://") ||
      originalUrl.startsWith("https://") ||
      originalUrl.startsWith("BASE_URL")
        ? originalUrl
        : `https://${originalUrl}`;

    if (
      expirationDate &&
      new Date(expirationDate) >
        new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000)
    ) {
      return toast.error(
        "Expiration date cannot be more than 2 years from the current date"
      );
    }

    if (scheduledDate && new Date(scheduledDate) < new Date(Date.now())) {
      return toast.error("Scheduled date cannot be in the past");
    }

    if (
      expirationDate &&
      scheduledDate &&
      new Date(expirationDate) <= new Date(scheduledDate)
    ) {
      return toast.error(
        "Expiration date cannot be before or equal to scheduled date"
      );
    }

    if (expirationDate && expirationDate <= new Date(Date.now())) {
      return toast.error("Expiration date cannot be in the past");
    }

    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalUrl: formattedUrl,
          alias,
          // expirationDate: formattedExpirationDate,
          expirationDate: expirationDate ? new Date(expirationDate) : null,
          scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setShortUrl(data.shortenUrl);
    } catch (err) {
      setError(err.message);

      if (
        err.message ===
        "This URL has already been shortened\nCheck Analytics Page"
      ) {
        toast.error("This URL has already been shortened");
      } else toast.error("An error occurred: " + err.message);
    }
  };

  const BASE_URL = process.env.BASE_URL || originalUrl;
  const generateQRCodeValue = (url) => {
    if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
      if (process.env.BASE_URL == "") return `https://${BASE_URL}/`;
      else return `https://${url}`;
    }
    return url;
  };

  const handleCopy = () => {
    if (shortenUrl) {
      navigator.clipboard
        .writeText(shortenUrl)
        .then(() => {
          toast.success("URL copied to clipboard!");
        })
        .catch((err) => {
          toast.error("Failed to copy: " + err);
        });
    }
  };

  const handleClick = (buttonName, action = () => {}) => {
    action();
    setClickedButton(buttonName);
    setTimeout(() => {
      setClickedButton(null);
    }, 1000);
  };

  const handleClear = () => {
    setOriginalUrl("");
    setCustomAlias("");
    setShortUrl("");
    setExpirationDate("");
    setScheduledDate("");
    setError("");
  };

  const handleSearchMobile = () => {
    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
    });
    document.dispatchEvent(event);
  };

  const downloadQRCode = async () => {
    if (qrCodeRef.current) {
      const svgElement = qrCodeRef.current.querySelector("svg");
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        // Find the image tag within the SVG and fetch the image as a Blob
        const imageElement = svgElement.querySelector("image");
        if (imageElement && imageElement.href.baseVal) {
          const imageUrl = imageElement.href.baseVal;
          // Fetch the image and convert it to Base64
          const imageResponse = await fetch(imageUrl);
          const imageBlob = await imageResponse.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            // Get the Base64 encoded image data
            const base64Image = reader.result.split(",")[1]; // Get data after 'data:image/png;base64,'
            // Replace the image URL with Base64 data in the SVG
            const updatedSvgData = svgData.replace(
              imageUrl,
              `data:image/png;base64,${base64Image}`
            );
            // Create a new Blob with the updated SVG content
            const updatedSvgBlob = new Blob([updatedSvgData], {
              type: "image/svg+xml",
            });
            // Create a canvas to draw the SVG
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();
            img.onload = function () {
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
              // Convert to PNG and trigger download
              const pngUrl = canvas.toDataURL("image/png");
              const a = document.createElement("a");
              a.href = pngUrl;
              a.download = `qr-code_${shortenUrl}.png`;
              a.click();
            };
            img.src = URL.createObjectURL(updatedSvgBlob);
          };
          reader.readAsDataURL(imageBlob);
        }
      }
    }
  };

  return (
    <>
      <Head>
        <title>ACES Share | Home</title>
        <link
          rel="icon"
          href="https://raw.githubusercontent.com/ACES-RMDSSOE/Website/main/images/favicon.ico"
        />
      </Head>
      <main className="relative overflow-x-hidden flex flex-col items-center justify-center h-screen font-inter min-h-svh bg-zinc-50 dark:bg-[#09090b]">
        {/* Gradients */}
        <GradientTop />
        <Nav />
        <SearchUrls />
        <div className="relative w-full py-24 overflow-x-hidden">
          <div className="container relative py-10 lg:py-16">
            <main className="max-w-2xl mx-auto text-center">
              <div className="header">
                <div className="flex justify-center items-center">
                  <a href="https://aces-rmdssoe.tech">
                    <img
                      src="https://raw.githubusercontent.com/ACES-RMDSSOE/Website/main/images/logo.png"
                      alt="ACES Logo"
                      border="0"
                      className="w-[7em] h-[7em] rounded-[50%] mt-3"
                    />
                  </a>
                </div>
                <h1 className="pt-4 pb-3 text-3xl font-bold xl:text-5xl md:text-4xl text-center">
                  <a
                    className="text-4xl font-extrabold tracking-tight scroll-m-20 lg:text-5xl"
                    href="/share"
                  >
                    Share
                  </a>
                </h1>
                <p className="small-caps text-center">
                  URL Shortener + QR Code Generator
                </p>
              </div>
              <header className="max-w-2xl mt-5">
                <h2 className="text-3xl font-extrabold tracking-tight scroll-m-20 lg:text-4xl">
                  Enter The Link!
                </h2>
              </header>

              <article className="max-w-2xl mt-5">
                <p className="text-base lg:text-lg text-muted-foreground">
                  Enter your link below. In case you want to
                  <br className="md:hidden" /> see analytics or manage links
                  head over to the{" "}
                  <a
                    href="/analytics"
                    className="hover:underline hover:text-blue-500"
                  >
                    <span>analytics page</span>
                    <LinkIcon className="inline-block w-6 ps-1 pe-1 aspect-square" />
                  </a>
                  <br className="md:hidden" /> Each link can only be shortened
                  once{" "}
                  <span className="hidden lg:inline-flex">
                    (Press{" "}
                    <kbd className="inline-flex items-center p-1 ml-2 mr-2 font-mono text-xs bg-gray-100 rounded ring-1 ring-gray-900/10 dark:bg-zinc-800 dark:ring-gray-900/50 dark:text-zinc-300 whitespace-nowrap">
                      <Command className="inline-block w-3 h-3" />
                      <span className="text-[.25rem]">&nbsp;</span>+
                      <span className="text-[.25rem]">&nbsp;</span>K
                    </kbd>{" "}
                    to see all URLs).
                  </span>
                </p>
              </article>

              {/* Buttons */}
              <form
                className="flex flex-col justify-center gap-3 mt-8"
                onSubmit={handleSubmit}
              >
                <section className="flex flex-col justify-center gap-3 mt-2 md:flex-row">
                  <Input
                    tabIndex={1}
                    type="text"
                    placeholder="Enter original URL"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    required
                  />
                  <Input
                    tabIndex={1}
                    type="text"
                    placeholder="Custom alias (optional)"
                    value={alias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                  />
                </section>
                <footer className="flex flex-row gap-3">
                  <Button
                    tabIndex={2}
                    type="submit"
                    className="flex-1"
                    onClick={() => handleClick("shorten")}
                  >
                    {clickedButton === "shorten" ? <Check /> : "Shorten"}
                  </Button>
                  <Button
                    tabIndex={2}
                    type="button"
                    className="flex-1 hidden lg:flex w-max"
                    onClick={() => handleClick("clear", handleClear)}
                  >
                    {clickedButton === "clear" ? <Check /> : "Clear"}
                  </Button>
                  <Button
                    tabIndex={2}
                    type="button"
                    className="flex lg:hidden w-max"
                  >
                    <span
                      className="flex w-4 aspect-square"
                      onClick={() => handleClick("clear", handleClear)}
                    >
                      {clickedButton === "clear" ? <Check /> : <Trash2Icon />}
                    </span>
                  </Button>
                  <Button type="button" tabIndex={2} variant="outline">
                    <span
                      className="flex w-4 aspect-square"
                      onClick={() => handleClick("copy", handleCopy)}
                    >
                      {clickedButton === "copy" ? <Check /> : <Copy />}
                    </span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    tabIndex={2}
                    onClick={() => {
                      setClickedButton("share");
                      downloadQRCode();
                    }}
                  >
                    <span className="flex w-4 aspect-square">
                      {clickedButton === "share" ? <Check /> : <ImageDown />}
                    </span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="hidden lg:block"
                  >
                    <a
                      className="flex w-4 aspect-square"
                      href="https://github.com/ACES-RMDSSOE/share"
                    >
                      <Github />
                    </a>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex lg:hidden"
                    onClick={handleSearchMobile}
                  >
                    <span className="flex w-4 aspect-square">
                      <SearchIcon />
                    </span>
                  </Button>
                </footer>
                <section className="flex flex-col justify-start items-start gap-3 mt-2 md:flex-row *:flex-1 p-2 md:mx-6 mx-10">
                  <div className="flex flex-col items-start w-full gap-1">
                    <label className="text-xs font-medium text-muted-foreground ps-1">
                      Expiration Date
                    </label>
                    <Input
                      tabIndex={3}
                      type="datetime-local"
                      placeholder="Expiration Date (Optional)"
                      value={expirationDate}
                      onFocus={(e) => (e.target.type = "datetime-local")}
                      onChange={(e) => setExpirationDate(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col items-start w-full gap-1 md:items-end">
                    <label className="text-xs font-medium text-muted-foreground pe-1">
                      Scheduled Date
                    </label>
                    <Input
                      tabIndex={3}
                      type="datetime-local"
                      placeholder="Scheduled Date (Optional)"
                      value={scheduledDate}
                      onFocus={(e) => (e.target.type = "datetime-local")}
                      onChange={(e) => setScheduledDate(e.target.value)}
                    />
                  </div>
                </section>
              </form>
              <section className="mt-4">
                {error && <p style={{ color: "red" }}>{error}</p>}
                {shortenUrl && (
                  <div className="flex flex-col items-center justify-center gap-4">
                    <header className="relative flex flex-col items-center justify-center gap-2 mt-6 mb-2 w-max">
                      <h2 className="absolute -top-[20%] font-mono pe-2 ps-2 bg-[#fafafa] dark:bg-[#09090b] font-light text-md text-muted-foreground small-caps">
                        Short url
                      </h2>
                      <a
                        href={generateQRCodeValue(shortenUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="z-10 inline-block px-6 py-4 font-mono border rounded-lg text-primary hover:underline"
                      >
                        {shortenUrl}
                      </a>
                    </header>
                    <footer
                      className="p-3 bg-white rounded-lg shadow"
                      ref={qrCodeRef}
                    >
                      <QRCodeSVG
                        value={generateQRCodeValue(shortenUrl)}
                        title={"Scan me!"}
                        size={128}
                        bgColor={"#ffffff"}
                        fgColor={"#000000"}
                        level={"H"}
                        marginSize={1}
                        imageSettings={{
                          src: "https://raw.githubusercontent.com/ACES-RMDSSOE/Website/main/images/favicon.ico",
                          x: undefined,
                          y: undefined,
                          height: 24,
                          width: 24,
                          opacity: 1,
                          excavate: true,
                        }}
                      />
                    </footer>
                  </div>
                )}
              </section>
            </main>
          </div>
        </div>
        <SpeedInsights />
      </main>
    </>
  );
}
