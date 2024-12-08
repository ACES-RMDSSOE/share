import { useState } from "react";
import { useRouter } from "next/router";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { ThemeToggle } from "@components/themeToggle";
import Head from "next/head";
import Image from "next/image";

export default function Home() {
  const [passcode, setPasscode] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const response = await fetch("/api/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ passcode }),
    });

    setLoading(false);

    if (response.ok) {
      router.push("/share");
    } else {
      const data = await response.json();
      setError(data.message);
    }
  };

  const handleThemeClick = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <>
      <Head>
        <title>ACES RMDSSOE | Who dis?</title>
        <meta
          name="description"
          content="Whoops, looks like you took a wrong turn. Let's get you back home."
        />
        <link
          rel="shortcut icon"
          href="https://raw.githubusercontent.com/ACES-RMDSSOE/Website/main/images/favicon.ico"
        />{" "}
      </Head>
      <main className="flex flex-col items-center justify-center h-screen c-beige:bg-beige-100">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-4"
        >
          <h1 className="text-3xl font-bold c-beige:text-beige-700/90">
            Hello :)
          </h1>
          <Input
            type="text"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Enter passcode"
            className="text-base c-beige:bg-beige-50/80 c-beige:border-beige-100 c-beige:placeholder:text-beige-800/50 c-beige:text-beige-800/80 c-beige:focus-visible:ring-beige-200 focus-visible:ring-offset-0"
          />
          <section className="flex space-x-3">
            <Button
              type="submit"
              className="text-sm c-beige:bg-beige-50/20 c-beige:border-beige-200 c-beige:focus-visible:ring-beige-200 c-beige:text-beige-700/80 focus-visible:ring-offset-0"
              variant="outline"
              disabled={loading}
            >
              {!loading ? (
                "Submit"
              ) : (
                <Image
                  src="/images/bars-scale.svg"
                  width={20}
                  height={20}
                  className="dark:invert"
                  alt="..."
                />
              )}
            </Button>
            <Button
              type="button"
              className="text-sm c-beige:bg-beige-50/60 c-beige:border-beige-200 c-beige:focus-visible:ring-beige-200 c-beige:text-beige-800/80 focus-visible:ring-offset-0"
              variant="secondary"
              onClick={handleThemeClick}
            >
              <ThemeToggle />
            </Button>
          </section>
        </form>
        {error && <p>{error}</p>}
        <SpeedInsights />
      </main>
    </>
  );
}