import React, { useState } from "react";
import ReactQueryProvider from "./react-query-provider";
import { useMutation, useQuery } from "react-query";
import type { FileSelect, NoteSelect } from "../../server/db/types";

interface SearchProps {
  children?: React.ReactNode;
}

const Search: React.FC<SearchProps> = (props) => {
  return (
    <ReactQueryProvider>
      <InnerSearch {...props} />
    </ReactQueryProvider>
  );
};

const InnerSearch: React.FC<SearchProps> = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filePreview, setFilePreview] = useState<
    FileSelect | NoteSelect | null
  >(null);

  const searchMutation = useMutation({
    mutationKey: ["search", searchTerm],
    mutationFn: async (query: string) => {
      const res = await fetch(`/api/search?q=${query}`);
      const json = (await res.json()) as {
        aiOverview: {
          response: string;
          fileId: string;
        };
        topMatches: Record<
          string,
          {
            chunkid: string;
            text: string;
            distance: number;
            file: FileSelect | NoteSelect;
          }
        >;
      };

      return json;
    },
    onSuccess: ({ aiOverview, topMatches }) => {
      const { file } = topMatches[aiOverview.fileId];
      setFilePreview(file);
    },
  });

  const mkeditor = useQuery({
    queryKey: ["mkeditor"],
    queryFn: async () => {
      const MKEditor = (await import("./MKEditor")).default;
      return { MKEditor };
    },
  });

  return (
    <div className="grid grid-cols-2 gap-x-4">
      <div className="flex flex-col space-y-6">
        <div className="w-full flex space-x-2 justify-between">
          <input
            className="px-4 bg-gray-200 py-2 outline-gray-400 outline text-2xl w-full rounded-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            type="text"
            placeholder="Type a search query..."
          />
          <button
            className="bg-gray-500  outline outline-gray-600 font-semibold px-4 rounded-sm"
            onClick={() => searchMutation.mutate(searchTerm)}
          >
            Search
          </button>
        </div>

        {searchMutation.data && (
          <div className="relative outline outline-gray-400 bg-gray-200 p-4 rounded-sm">
            <p className="pr-24 text-gray-800">
              {searchMutation.data?.aiOverview.response}
            </p>{" "}
            <div className="absolute top-4 text-gray-900 right-4 font-semibold">
              AI Answer
            </div>
          </div>
        )}

        {searchMutation.isLoading && (
          <div className="relative outline outline-gray-400 bg-gray-200 p-4 rounded-sm">
            <div className="flex flex-col space-y-2">
              <div className="w-[70%] h-6 rounded-md bg-gray-300 animate-pulse"></div>
              <div className="w-[80%] h-6 rounded-md bg-gray-300 animate-pulse"></div>
              <div className="w-[72%] h-6 rounded-md bg-gray-300 animate-pulse"></div>
            </div>
            <div className="absolute top-4 right-4">
              <div className="w-20 h-7 bg-gray-400 animate-pulse rounded-md"></div>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-semibold text-black dark:text-white">Results: </h2>

        {Object.keys(searchMutation.data?.topMatches ?? {}).map((fileId) => {
          const { file, text } = searchMutation.data?.topMatches[fileId]!;

          console.log(searchMutation.data);
          console.log(searchMutation.data?.topMatches[fileId]!);

          const summary = text.slice(0, 200) + "...";

          let nameWithoutExtension = "";
          let path = "";

          if ("title" in file) {
            nameWithoutExtension = file.title ?? "Missing Note Title";
            path = "/notes";
          } else {
            nameWithoutExtension =
              file.name?.split(".")[0] ?? "Missing File Name";
            path = "/files";
          }

          return (
            <a key={file.id} href={`${path}/${file.id}`}>
              <h3 className="text-xl">{nameWithoutExtension}</h3>
              <p>{summary}</p>
            </a>
          );
        })}
      </div>

      <div className="w-full sticky top-0 ">
        {searchMutation.data && filePreview && "media" in filePreview && (
          <iframe
            src={filePreview?.media ?? ""}
            className="w-full min-h-[80vh]"
          />
        )}
        {searchMutation.data &&
          filePreview &&
          "content" in filePreview &&
          mkeditor.data &&
          !mkeditor.isLoading && (
            <div>
              <h2 className="dark:text-white text-2xl font-semibold tracking-wide mb-2">
                {filePreview.title ?? "Missing Title"}
              </h2>
              <mkeditor.data.MKEditor
                delLoading={false}
                loading={false}
                onDelete={() => void 0}
                onSave={() => void 0}
                setContent={() => void 0}
                content={filePreview.content ?? ""}
              />
            </div>
          )}

        {searchMutation.isLoading && (
          <div className="w-full min-h-[80vh] rounded-md bg-gray-500 animate-pulse"></div>
        )}
      </div>
    </div>
  );
};

export default Search;
