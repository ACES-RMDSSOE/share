import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandDialog,
} from "@components/ui/command";
import { LinkIcon, ExternalLinkIcon } from "lucide-react";

const SearchUrls = () => {
  const [error, setError] = useState("");
  const [urls, setUrls] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0); // Track the selected item index
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const res = await fetch("/api/analytics");
        const data = await res.json();
        setUrls(data);
      } catch (error) {
        setError("Failed to fetch URLs");
      }
    };

    fetchUrls();
  }, []);

  // Filter URLs based on search query
  const filteredUrls = urls.filter(
    (url) =>
      url.originalUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      url.shortenUrl.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && filteredUrls.length > 0) {
      const selectedUrl = filteredUrls[selectedIndex];
      // window.open(`/analytics?id=${selectedUrl._id}`, "_blank");
    }

    if (e.key === "k" && (e.metaKey || e.ctrlKey || e.altKey)) {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [filteredUrls, selectedIndex]);

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      className="border rounded-lg max-w-3/4 lg:w-1/4"
    >
      <CommandInput
        placeholder="Search for a link..."
        onChange={handleSearchChange}
        className="px-4 pb-2 "
      />
      <CommandList className="px-2 py-4">
        {urls.length === 0 ? (
          <CommandEmpty>{error ? error : "No URLs found"}</CommandEmpty>
        ) : (
          <CommandGroup heading="Search URLs">
            {filteredUrls.map((url, index) => (
              <CommandItem
                key={index}
                onSelect={() => {
                  router.push(`/analytics?id=${url._id}`); // Redirect when item is selected
                  // window.open(`/analytics?id=${url._id}`, "_blank");
                }}
                className="border-b last:border-b-0"
              >
                <article className="flex items-center gap-2 p-1 space-x-1">
                  <img
                    src={`http://www.google.com/s2/favicons?sz=64&domain=${url.originalUrl}`}
                    width="32"
                    height="32"
                    alt="L"
                    className="block rounded aspect-square "
                  />
                  <section className="flex flex-col space-y-2">
                    <main className="flex items-center space-x-3 font-mono">
                      <ExternalLinkIcon className="w-4 h-4" />
                      <a
                        href={url.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-normal hover:text-blue-400 hover:underline"
                      >
                        {url.originalUrl.replace(/^https?:\/\//, "")}
                      </a>
                    </main>
                    <div className="flex items-center space-x-3 font-mono text-muted-foreground">
                      <LinkIcon className="w-4 h-4" />
                      <Link
                        href={`/analytics?id=${url._id}`}
                        target="_blank"
                        className="text-[.75rem] hover:underline"
                        passHref
                      >
                        {url.shortenUrl}
                      </Link>
                    </div>
                  </section>
                </article>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
};

export default SearchUrls;
