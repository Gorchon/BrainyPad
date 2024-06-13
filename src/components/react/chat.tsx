import React, { useState, useRef } from "react";
import ReactQueryProvider, { queryClient } from "./react-query-provider";
import { useMutation, useQuery } from "react-query";
import type { MessageSelect } from "../../server/db/types";
import type { Reference } from "../../pages/api/assistant/chat";
import { Loader, Trash2 } from "lucide-react";
// import useWindowSize from "react-use/lib/useWindowSize";
import Confetti from "react-confetti";

type ChatProps =
  | {
      id: string;
      type: "file" | "note";
      // These functions expose the ability to run some
      // code when the quiz starts and ends. This is useful
      // for updating the UI, for hiding the note's content
      // while the quiz is running, for example.
      onQuizStart?: () => void;
      onQuizEnd?: () => void;
    }
  | { id?: undefined; type?: undefined };

const Chat: React.FC<ChatProps> = (props) => {
  return (
    <ReactQueryProvider>
      <InnerChat {...props} />
    </ReactQueryProvider>
  );
};

const InnerChat: React.FC<ChatProps> = ({ id, type, ...rest }) => {
  const [referencedFiles, setReferencedFiles] = useState<Reference[]>([]);
  const [isOnQuiz, setIsOnQuiz] = useState(false);
  const [answers, setAnswers] = useState<
    Record<
      `question${number}`,
      {
        selected: number;
      }
    >
  >({
    question1: {
      selected: -1,
    },
    question2: {
      selected: -1,
    },
    question3: {
      selected: -1,
    },
  });
  const [quizResult, setQuizResult] = useState<number | null>(null);

  const messagesRes = useQuery({
    queryKey: ["messages", type, id],
    queryFn: async () => {
      const endpoint = id
        ? `/api/assistant/chat/${id}?type=${type}`
        : `/api/assistant/chat`;

      const response = await fetch(endpoint);
      const data = (await response.json()) as Promise<{
        messages: MessageSelect[];
      }>;

      return data;
    },
  });

  const sendMessageMutation = useMutation({
    mutationKey: [type, id, "send-mutation"],
    mutationFn: async (message: string) => {
      const endpoint = id
        ? `/api/assistant/chat/${id}?type=${type}&message=${message}`
        : `/api/assistant/chat?message=${message}`;

      const response = await fetch(endpoint);
      const data = (await response.json()) as Promise<{
        messages: MessageSelect[];
        reference?: Reference;
      }>;

      return data;
    },
    onMutate: () => scrollToBottom(),
    onSuccess: (data) => {
      if (data.reference) {
        setReferencedFiles([...referencedFiles, data.reference]);
      }
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["messages", type, id] }),
  });

  const deleteConversationMutation = useMutation({
    mutationKey: [id, "delete-conversation-mutation"],
    mutationFn: async (id: string) => {
      const endpoint = `/api/conversations/${id}`;

      return fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      messagesRes.refetch();
    },
  });

  const makeQuizMutation = useMutation({
    mutationKey: [id, "make-quiz-mutation"],
    mutationFn: async () => {
      const endpoint = `/api/assistant/quiz/${id}`;

      return fetch(endpoint).then((res) => res.json()) as Promise<{
        questions: {
          question: string;
          options: { option: string; correct: boolean }[];
        }[];
      }>;
    },
    onSuccess: () => {
      setIsOnQuiz(true);
      if ("onQuizStart" in rest && rest.onQuizStart) {
        rest.onQuizStart();
      }
    },
  });

  const checkAnswers = () => {
    if (!isOnQuiz) return;
    if (!makeQuizMutation.data) return;

    let correctAnswers = 0;

    Object.entries(answers).forEach(([key, value]) => {
      const questionNumber = parseInt(key.replace("question", "")) - 1;
      const selectedOption = value.selected;
      const correctIndex = makeQuizMutation.data.questions[
        questionNumber
      ].options.findIndex((opt) => opt.correct);

      if (selectedOption === correctIndex) {
        correctAnswers++;
      }
    });

    setQuizResult(correctAnswers);
    console.log("Correct answers:", correctAnswers);
  };

  const endQuiz = () => {
    setIsOnQuiz(false);
    setQuizResult(null);
    setAnswers({
      question1: {
        selected: -1,
      },
      question2: {
        selected: -1,
      },
      question3: {
        selected: -1,
      },
    });
    if ("onQuizEnd" in rest && rest.onQuizEnd) {
      rest.onQuizEnd();
    }
  };

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  function handleSend() {
    sendMessageMutation.mutate(input);
    setInput("");
  }

  return (
    <div className="flex flex-grow justify-evenly space-x-3 overflow-y-clip">
      {quizResult && makeQuizMutation.data && (
        <div className="fixed top-0 left-0 bottom-0 right-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-8 flex flex-col space-y-4 rounded-md">
            <h2 className="text-2xl font-semibold">Quiz results</h2>
            <p>You got {quizResult}/3</p>
            {makeQuizMutation.data.questions.map((question, qIdx) => {
              const correctIdx = question.options.findIndex((o) => o.correct);
              const answerIdx = answers[`question${qIdx + 1}`].selected;

              if (answerIdx !== correctIdx) {
                return (
                  <div>
                    <p>You got question {qIdx + 1} wrong!</p>
                    <p>Your answer: {question.options[answerIdx].option}</p>
                    <p>Correct answer: {question.options[correctIdx].option}</p>
                  </div>
                );
              }
            })}
            <button
              onClick={endQuiz}
              className="bg-gray-600 hover:bg-blue-700 text-white px-7 py-2 rounded-lg focus:outline-none border-2 border-gray-300 dark dark:bg-sidebar dark:border-gray-500 dark:hover:bg-blue-500 dark:text-white"
            >
              End Quiz
            </button>
          </div>
        </div>
      )}
      {quizResult && quizResult === 3 && (
        <Confetti
          width={window.document.body.clientWidth}
          height={window.document.body.clientHeight}
        />
      )}
      <div
        className="flex flex-col h-screen bg-[#e3e8ed] w-full rounded-lg shadow relative dark:bg-chat"
        style={{ height: "85vh" }}
      >
        {!!id && (
          <div className="flex space-x-2 p-4 bg-gray-300 dark:bg-card">
            <button
              disabled={makeQuizMutation.isLoading}
              onClick={() => {
                makeQuizMutation.mutate();
              }}
              className="bg-gray-600 hover:bg-blue-700 text-white px-7 py-2 rounded-lg focus:outline-none border-2 border-gray-300 dark dark:bg-sidebar dark:border-gray-500 dark:hover:bg-blue-500 dark:text-white"
            >
              {makeQuizMutation.isLoading ? "Making quiz..." : "Make a quiz"}
            </button>
          </div>
        )}
        <div
          className="flex-grow overflow-auto p-4 pb-20"
          style={{ maxHeight: "calc(85vh - 75px)" }}
        >
          {messagesRes.isLoading || !messagesRes.data ? (
            <>Loading...</>
          ) : (
            <>
              {!isOnQuiz &&
                messagesRes.data.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`dark:text-white my-2 mx-4 p-2 rounded-lg shadow max-w-lg ${
                      !message.wasFromAi
                        ? "ml-auto bg-blue-100 dark:bg-card-footer "
                        : "mr-auto bg-gray-200 dark:bg-message"
                    }`}
                  >
                    {message.content}
                  </div>
                ))}
              {sendMessageMutation.isLoading && (
                <div className="my-2 mx-4 p-2 rounded-lg shadow max-w-lg ml-auto bg-blue-100 dark:bg-card-footer dark:text-white animate-pulse">
                  {sendMessageMutation.variables}
                </div>
              )}
            </>
          )}
          <>
            {!makeQuizMutation.isLoading &&
              makeQuizMutation.isSuccess &&
              makeQuizMutation.data &&
              isOnQuiz && (
                <div>
                  {makeQuizMutation.data.questions.map((question, qIdx) => {
                    return (
                      <div>
                        <h3 className="dark:text-white">Question {qIdx + 1}</h3>
                        <p className="dark:text-white">{question.question}</p>
                        {question.options.map((option, oIdx) => {
                          return (
                            <div
                              className="flex space-x-2 items-center dark:text-white"
                              onClick={() => {
                                setAnswers((prev) => ({
                                  ...prev,
                                  [`question${qIdx + 1}`]: {
                                    selected: oIdx,
                                  },
                                }));
                              }}
                            >
                              <div
                                className={`h-4 w-4 border-black border rounded-full ${
                                  answers[`question${qIdx + 1}`].selected ===
                                  oIdx
                                    ? "bg-gray-400 dark:bg-sidebar"
                                    : "bg-gray-200"
                                }`}
                              />
                              <p>{option.option}</p>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                  <button
                    onClick={checkAnswers}
                    className="bg-blue-500 text-white p-2 rounded-lg dark:bg-gray-600 dark:hover:bg-gray-400"
                  >
                    Submit answers
                  </button>
                </div>
              )}
          </>
          <div ref={messagesEndRef} />
        </div>
        <div className="flex items-center p-2 bg-gray-100 absolute bottom-0 w-full dark:bg-borders">
          <input
            className="flex-grow p-2 border-2 border-r-0 border-gray-300 rounded-l-lg focus:outline-none dark:bg-card dark:text-white dark:border-gray-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Write your message"
          />
          <button
            className="bg-gray-600 hover:bg-blue-700 text-white px-7 py-2 rounded-r-lg focus:outline-none border-2 border-gray-300 dark dark:bg-sidebar dark:border-gray-500 dark:hover:bg-blue-500 dark:text-white"
            onClick={handleSend}
          >
            Send
          </button>
          {deleteConversationMutation.isLoading ? (
            <Loader size={30} className="stroke-2 motion-safe:animate-spin dark:stroke-white" />
          ) : (
            <Trash2
              onClick={() =>
                deleteConversationMutation.mutate(
                  messagesRes.data?.messages[0].conversationId ?? ""
                )
              }
              size={30}
              className="cursor-pointer stroke-2 dark:stroke-white"
            />
          )}
        </div>
      </div>
      {!id && (
        <div className="bg-[#e3e8ed] dark:bg-card flex flex-col justify-start items-start w-full h-full p-4 rounded-lg shadow-lg mr-5">
          <h2 className="font-bold text-lg dark:text-white mb-3">
            Sources Referenced
          </h2>
          <ul className="pl-4 dark:text-white mb-2">
            {referencedFiles.map((ref, idx) => (
              <li className="list-disc text-lg" key={`${idx}_${ref.id}`}>
                <a href={`${ref.type}s/${ref.id}`}>{`${ref.title} (${
                  idx + 1
                })`}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Chat;