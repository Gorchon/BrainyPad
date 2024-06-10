import {
  AdmonitionDirectiveDescriptor,
  BoldItalicUnderlineToggles,
  ChangeCodeMirrorLanguage,
  codeBlockPlugin,
  codeMirrorPlugin,
  CodeToggle,
  ConditionalContents,
  CreateLink,
  directivesPlugin,
  frontmatterPlugin,
  imagePlugin,
  InsertAdmonition,
  InsertCodeBlock,
  InsertSandpack,
  InsertTable,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  MDXEditor,
  quotePlugin,
  sandpackPlugin,
  ShowSandpackInfo,
  tablePlugin,
  toolbarPlugin,
  UndoRedo,
  type SandpackConfig,
  Button,
} from "@mdxeditor/editor";
import {
  Home,
  Loader,
  Save,
} from "lucide-react";
import { headingsPlugin } from "@mdxeditor/editor";

import "@mdxeditor/editor/style.css";
import { useEffect, useState } from "react";

interface MKEditorProps {
  content: string;
  setContent: (content: string) => void;
  onChange?: (markdown: string) => void;
  loading: boolean;
  onSave: () => void;
}

type SaveButtonProps = {
  loading: boolean;
  onSave: () => void;
}

function SaveButton({
  loading,
  onSave,
}: SaveButtonProps) {
  return (
    <Button
      onClick={() => {
        onSave();
      }}
    >
      {loading ? (
        <Loader className="stroke-[2.5px] motion-safe:animate-spin" />
      ) : (
        <Save size={20} className="stroke-[2.5px]" />
      )}
    </Button>
  );
}

export default function MKEditor({
  content,
  setContent,
  onChange,
  loading,
  onSave,
}: MKEditorProps) {
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    setIsFirstRender(false);
  }, []);

  async function imageUploadHandler(image: File) {
    const formData = new FormData();
    formData.append("image", image);
    // send the file to your server and return
    // the URL of the uploaded image in the response
    const response = await fetch("/uploads/new", {
      method: "POST",
      body: formData,
    });
    const json = (await response.json()) as { url: string };
    return json.url;
  }

  const defaultSnippetContent = `
export default function App() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
    </div>
  );
}
`.trim();

  const simpleSandpackConfig: SandpackConfig = {
    defaultPreset: "react",
    presets: [
      {
        label: "React",
        name: "react",
        meta: "live react",
        sandpackTemplate: "react",
        sandpackTheme: "light",
        snippetFileName: "/App.js",
        snippetLanguage: "jsx",
        initialSnippetContent: defaultSnippetContent,
      },
    ],
  };

  return (
    <>
      {!isFirstRender && (
        <MDXEditor
          onChange={(newMarkdown) => {
            setContent(newMarkdown);
            onChange?.(newMarkdown);
          }}
          markdown={content}
          className="w-full "
          contentEditableClassName="prose dark:text-white"
          plugins={[
            headingsPlugin(),
            listsPlugin(),
            linkPlugin(),
            quotePlugin(),
            markdownShortcutPlugin(),
            tablePlugin(),
            frontmatterPlugin(),
            toolbarPlugin({
              toolbarContents: () => (
                <>
                  <UndoRedo />
                  <BoldItalicUnderlineToggles />
                  <InsertAdmonition />
                  <CreateLink />
                  <CodeToggle />
                  <ConditionalContents
                    options={[
                      {
                        when: (editor) => editor?.editorType === "codeblock",
                        contents: () => <ChangeCodeMirrorLanguage />,
                      },
                      {
                        when: (editor) => editor?.editorType === "sandpack",
                        contents: () => <ShowSandpackInfo />,
                      },
                      {
                        fallback: () => (
                          <>
                            <InsertCodeBlock />
                            <InsertSandpack />
                          </>
                        ),
                      },
                    ]}
                  />
                  <ListsToggle />
                  <InsertTable />
                  <SaveButton loading={loading} onSave={onSave} />
                </>
              ),
            }),
            linkDialogPlugin(),
            imagePlugin({ imageUploadHandler }),
            directivesPlugin({
              directiveDescriptors: [AdmonitionDirectiveDescriptor],
            }),
            codeBlockPlugin({ defaultCodeBlockLanguage: "js" }),
            sandpackPlugin({ sandpackConfig: simpleSandpackConfig }),
            codeMirrorPlugin({
              codeBlockLanguages: { js: "JavaScript", css: "CSS" },
            }),
          ]}
        />
      )}
    </>
  );
}
