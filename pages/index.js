import { useState } from "react";
import { useRouter } from "next/router";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { ThemeToggle } from "@components/themeToggle";
import Head from "next/head";

export default function Home() {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("/api/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ passcode }),
    });

    if (response.ok) {
      router.push("/share");
    } else {
      const data = await response.json();
      setError(data.message);
    }
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
      <main className="flex flex-col items-center justify-center h-screen">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-4"
        >
          <h1 className="text-2xl font-bold">Hello :)</h1>
          <Input
            type="text"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Enter passcode"
            className="text-base"
          />
          <section className="flex space-x-3">
            <Button type="submit" className="text-sm" variant="outline">
              Submit
            </Button>
            <Button className="text-sm" variant="secondary">
              <ThemeToggle />
            </Button>
          </section>{" "}
        </form>
        {error && <p>{error}</p>}
        <SpeedInsights />
      </main>
    </>
  );
}
