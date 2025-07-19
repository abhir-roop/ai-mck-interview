import WebCam from "react-webcam";
import {
  CircleStop,
  Mic,
  Pencil,
  RefreshCw,
  Save,
  Video,
  VideoOff,
  WebcamIcon,
  Send,
} from "lucide-react";

import useSpeechToText, { ResultType } from "react-hook-speech-to-text";

import { TooltipButton } from "@/components/tooltip-button";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { chatSession } from "@/scripts/ai-studio";
import { SaveModal } from "@/components/save-modal";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { useAuth } from "@clerk/clerk-react";
import { useParams } from "react-router-dom";
import { useKeyboardShortcuts } from "@/lib/keyboard";
import { KeyboardInput } from "@/components/keyboard-input";

interface RecordAnswerProps {
  question: { question: string; answer: string };
  isWebCam: boolean;
  setIsWebCam: (value: boolean) => void;
  onSubmit?: () => void;
}

interface AIResponse {
  ratings: number;
  feedback: string;
}

export const RecordAnswer = ({
  question,
  isWebCam,
  setIsWebCam,
  onSubmit,
}: RecordAnswerProps) => {
  const {
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  const [userAnswer, setUserAnswer] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<AIResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { userId } = useAuth();
  const { interviewId } = useParams();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isWritingMode, setIsWritingMode] = useState(false);

  const recordUserAnswer = async () => {
    if (isRecording) {
      stopSpeechToText();

      if (userAnswer?.length < 30) {
        toast.error("Error", {
          description: "Your answer should be more than 30 characters",
        });

        return;
      }

      const aiResult = await generateResult(
        question.question,
        question.answer,
        userAnswer
      );

      setAiResult(aiResult);
    } else {
      startSpeechToText();
    }
  };

  const cleanJsonResponse = (responseText: string) => {
    // Step 1: Trim any surrounding whitespace
    let cleanText = responseText.trim();

    // Step 2: Remove any occurrences of "json" or code block symbols (``` or `)
    cleanText = cleanText.replace(/(json|```|`)/g, "");

    // Step 3: Parse the clean JSON text into an array of objects
    try {
      return JSON.parse(cleanText);
    } catch (error) {
      throw new Error("Invalid JSON format: " + (error as Error)?.message);
    }
  };

  const generateResult = async (
    qst: string,
    qstAns: string,
    userAns: string
  ): Promise<AIResponse> => {
    setIsAiGenerating(true);

    const prompt = `
      Question: "${qst}"
      User Answer: "${userAns}"
      Correct Answer: "${qstAns}"
      Please compare the user's answer to the correct answer, and provide a rating (from 1 to 10) based on answer quality, and offer feedback for improvement.
      Return the result in JSON format with the fields "ratings" (number) and "feedback" (string).
    `;

    try {
      const aiResult = await chatSession.sendMessage(prompt);

      const parsedResult: AIResponse = cleanJsonResponse(
        aiResult.response.text()
      );
      return parsedResult;
    } catch (error) {
      console.log(error);
      toast.error("Error", {
        description: "An error occurred while generating feedback.",
      });
      return { ratings: 0, feedback: "Unable to generate feedback" };
    } finally {
      setIsAiGenerating(false);
    }
  };

  const recordNewAnswer = () => {
    setUserAnswer("");
    stopSpeechToText();
    startSpeechToText();
  };

  // Save answer as draft (does not submit for feedback)
  const saveDraftAnswer = async (answer: string) => {
    setLoading(true);
    try {
      const userAnswerQuery = query(
        collection(db, "userAnswers"),
        where("userId", "==", userId),
        where("question", "==", question.question)
      );
      const querySnap = await getDocs(userAnswerQuery);
      if (!querySnap.empty) {
        // Update existing draft
        const docRef = doc(db, "userAnswers", querySnap.docs[0].id);
        await updateDoc(docRef, {
          user_ans: answer,
          isDraft: true,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Create new draft
        await addDoc(collection(db, "userAnswers"), {
          mockIdRef: interviewId,
          question: question.question,
          correct_ans: question.answer,
          user_ans: answer,
          isDraft: true,
          userId,
          createdAt: serverTimestamp(),
        });
      }
      setLastSavedContent(answer);
      toast.success("Draft saved. You can review or edit before submitting.");
    } catch (error) {
      toast.error("Error saving draft");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Update saveUserAnswer to accept isDraft flag
  const saveUserAnswer = async (answer: string, aiResult: AIResponse, isDraft = false) => {
    setLoading(true);
    if (!aiResult && !isDraft) {
      return;
    }
    const currentQuestion = question.question;
    try {
      const userAnswerQuery = query(
        collection(db, "userAnswers"),
        where("userId", "==", userId),
        where("question", "==", currentQuestion)
      );
      const querySnap = await getDocs(userAnswerQuery);
      if (!querySnap.empty) {
        const docRef = doc(db, "userAnswers", querySnap.docs[0].id);
        await updateDoc(docRef, {
          user_ans: answer,
          feedback: isDraft ? undefined : aiResult.feedback,
          rating: isDraft ? undefined : aiResult.ratings,
          isDraft,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "userAnswers"), {
          mockIdRef: interviewId,
          question: question.question,
          correct_ans: question.answer,
          user_ans: answer,
          feedback: isDraft ? undefined : aiResult.feedback,
          rating: isDraft ? undefined : aiResult.ratings,
          isDraft,
          userId,
          createdAt: serverTimestamp(),
        });
      }
      if (!isDraft) {
        toast("Saved", { description: "Your answer has been submitted." });
      }
      stopSpeechToText();
    } catch (error) {
      toast.error("Error", {
        description: "An error occurred while saving your answer.",
      });
      console.log(error);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const handleSave = async () => {
    if (!userAnswer || loading || userAnswer === lastSavedContent) return;

    setLoading(true);
    try {
      const interviewsRef = collection(db, "interviews");
      const q = query(
        interviewsRef,
        where("userId", "==", userId),
        where("interviewId", "==", interviewId)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docRef = doc(db, "interviews", querySnapshot.docs[0].id);
        await updateDoc(docRef, {
          answer: userAnswer,
          aiResult,
          updatedAt: serverTimestamp(),
        });
        setLastSavedContent(userAnswer);
        toast.success("Answer saved successfully!");
      }
    } catch (error) {
      toast.error("Failed to save answer");
      console.error("Save error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWritingMode = () => {
    setIsWritingMode(!isWritingMode);
    if (!isWritingMode) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  };

  // Setup keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: " ",
      callback: () => {
        // Only trigger space shortcut if NOT in writing mode
        if (!isWritingMode) {
          recordUserAnswer();
        }
      },
      preventDefault: !isWritingMode, // Only prevent default if not in writing mode
    },
    {
      key: "s",
      ctrl: true,
      callback: () => handleSave(),
      preventDefault: true,
    },
    {
      key: "v",
      ctrl: true,
      callback: () => setIsWebCam(!isWebCam),
      preventDefault: true,
    },
    {
      key: "w",
      ctrl: true,
      callback: () => toggleWritingMode(),
      preventDefault: true,
    },
  ]);

  // Setup auto-save
  useEffect(() => {
    if (userAnswer && userAnswer !== lastSavedContent) {
      const timeoutId = window.setTimeout(() => {
        handleSave();
      }, 30000); // Auto-save every 30 seconds if there are changes

      return () => window.clearTimeout(timeoutId);
    }
  }, [userAnswer, lastSavedContent]);

  useEffect(() => {
    // combine all transcripts into a single answers
    const combinedTranscripts = results
      .filter((result): result is ResultType => typeof result !== "string")
      .map((result) => result.transcript)
      .join(" ");

    setUserAnswer(combinedTranscripts);
  }, [results]);

  // Check for existing answer when question changes
  useEffect(() => {
    if (!userId || !question?.question) return;
    const checkExistingAnswer = async () => {
      const userAnswerQuery = query(
        collection(db, "userAnswers"),
        where("userId", "==", userId),
        where("question", "==", question.question)
      );
      const querySnap = await getDocs(userAnswerQuery);
      if (!querySnap.empty) {
        const data = querySnap.docs[0].data();
        if (data.isDraft) {
          setIsSubmitted(false);
          setUserAnswer(data.user_ans || "");
        } else {
          setIsSubmitted(true);
          setUserAnswer("");
        }
      } else {
        setIsSubmitted(false);
        setUserAnswer("");
      }
    };
    checkExistingAnswer();
  }, [userId, question?.question]);

  // Keyboard handler for textarea
  useEffect(() => {
    if (!isWritingMode) return;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Tab/Shift+Tab for indent/outdent
      if (e.key === "Tab") {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;
        if (e.shiftKey) {
          // Outdent
          const before = value.substring(0, start);
          const after = value.substring(end);
          if (value.substring(start - 2, start) === "  ") {
            textarea.value =
              before.slice(0, -2) + value.substring(start, end) + after;
            textarea.selectionStart = textarea.selectionEnd = start - 2;
          }
        } else {
          // Indent
          textarea.value =
            value.substring(0, start) + "  " + value.substring(start, end) + value.substring(end);
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }
        setUserAnswer(textarea.value);
      }
      // Ctrl+Enter to submit
      if (e.key === "Enter" && e.ctrlKey) {
        e.preventDefault();
        if (userAnswer.length >= 30) {
          setIsAiGenerating(true);
          generateResult(
            question.question,
            question.answer,
            userAnswer
          ).then(setAiResult);
        } else {
          toast.error("Error", {
            description: "Your answer should be more than 30 characters",
          });
        }
      }
      // Esc to exit writing mode
      if (e.key === "Escape") {
        setIsWritingMode(false);
      }
    };
    textarea.addEventListener("keydown", handleKeyDown);
    return () => textarea.removeEventListener("keydown", handleKeyDown);
  }, [isWritingMode, userAnswer, question.question, question.answer]);

  return (
    <>
      <div className="w-full flex flex-col items-center gap-8 mt-4">
        {/* save modal */}

        <SaveModal
          isOpen={open}
          onClose={() => setOpen(false)}
          onConfirm={() => aiResult && saveUserAnswer(userAnswer, aiResult)}
          loading={loading}
        />

        <div className="w-full h-[400px] md:w-96 flex flex-col items-center justify-center border p-4 bg-gray-50 rounded-md">
          {isWebCam ? (
            <WebCam
              onUserMedia={() => setIsWebCam(true)}
              onUserMediaError={() => setIsWebCam(false)}
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            <WebcamIcon className="min-w-24 min-h-24 text-muted-foreground" />
          )}
        </div>

        {/* action buttons group */}
        <div className="flex items-center justify-center gap-3">
          <TooltipButton
            content={isWebCam ? "Turn Off" : "Turn On"}
            icon={
              isWebCam ? (
                <VideoOff className="min-w-5 min-h-5" />
              ) : (
                <Video className="min-w-5 min-h-5" />
              )
            }
            onClick={() => setIsWebCam(!isWebCam)}
          />

          <TooltipButton
            content={isRecording ? "Stop Recording" : "Start Recording"}
            icon={
              isRecording ? (
                <CircleStop className="min-w-5 min-h-5" />
              ) : (
                <Mic className="min-w-5 min-h-5" />
              )
            }
            onClick={recordUserAnswer}
          />

          <TooltipButton
            content="Record Again"
            icon={<RefreshCw className="min-w-5 min-h-5" />}
            onClick={recordNewAnswer}
          />

          <TooltipButton
            content={isWritingMode ? "Switch to Voice Answer" : "Type Your Answer"}
            icon={<Pencil className="min-w-5 min-h-5" />}
            onClick={toggleWritingMode}
          />

          <TooltipButton
            content="Submit for Feedback"
            icon={<Send className="min-w-5 min-h-5" />}
            onClick={async () => {
              if (!isSubmitted && userAnswer.length >= 30) {
                setIsAiGenerating(true);
                try {
                  const result = await generateResult(
                    question.question,
                    question.answer,
                    userAnswer
                  );
                  setAiResult(result);
                  setIsSubmitted(true);
                  // Save as submitted (not draft)
                  await saveUserAnswer(userAnswer, result, false);
                  setUserAnswer("");
                  if (typeof onSubmit === "function") onSubmit();
                } finally {
                  setIsAiGenerating(false);
                }
              } else if (!isSubmitted) {
                toast.error("Error", {
                  description: "Your answer should be more than 30 characters",
                });
              }
            }}
          />

          <TooltipButton
            content="Save Answer"
            icon={<Save className="min-w-5 min-h-5" />}
            onClick={async () => {
              if (userAnswer.length >= 30) {
                await saveDraftAnswer(userAnswer);
              } else {
                toast.error("Error", {
                  description: "Your answer should be more than 30 characters",
                });
              }
            }}
          />
        </div>

        {/* answer input mode toggle */}
        <div className="w-full flex justify-end mt-4">
          <button
            type="button"
            className={`px-4 py-2 rounded font-medium border transition-colors duration-150 ${isWritingMode ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-600 border-emerald-600 hover:bg-emerald-50'}`}
            onClick={toggleWritingMode}
          >
            {isWritingMode ? 'Switch to Voice Answer' : 'Type Your Answer'}
          </button>
        </div>

        {/* answer input section */}
        {isWritingMode ? (
          <div className="w-full mt-4">
            <KeyboardInput
              value={userAnswer}
              onChange={setUserAnswer}
              textareaRef={textareaRef}
              disabled={isAiGenerating || isSubmitted}
              onSubmit={async () => {
                if (userAnswer.length >= 30) {
                  setIsAiGenerating(true);
                  try {
                    const result = await generateResult(
                      question.question,
                      question.answer,
                      userAnswer
                    );
                    setAiResult(result);
                    setIsSubmitted(true);
                    await saveUserAnswer(userAnswer, result);
                    setUserAnswer(""); // Clear answer after saving
                  } finally {
                    setIsAiGenerating(false);
                  }
                } else {
                  toast.error("Error", {
                    description: "Your answer should be more than 30 characters",
                  });
                }
              }}
            />
            {!isSubmitted && (
              <button
                type="button"
                className="mt-4 w-full px-4 py-3 text-lg bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50 font-semibold"
                disabled={userAnswer.length < 30 || isAiGenerating}
                onClick={async () => {
                  if (userAnswer.length >= 30) {
                    setIsAiGenerating(true);
                    try {
                      const result = await generateResult(
                        question.question,
                        question.answer,
                        userAnswer
                      );
                      setAiResult(result);
                      setIsSubmitted(true);
                      await saveUserAnswer(userAnswer, result);
                      setUserAnswer(""); // Clear answer after saving
                    } finally {
                      setIsAiGenerating(false);
                    }
                  } else {
                    toast.error("Error", {
                      description: "Your answer should be more than 30 characters",
                    });
                  }
                }}
              >
                {isAiGenerating ? "Submitting..." : "Submit Answer"}
              </button>
            )}
            {isSubmitted && (
              <div className="mt-2 text-green-700 font-semibold">Answer submitted. You cannot edit it anymore.</div>
            )}
          </div>
        ) : (
          <div className="w-full mt-4 p-4 border rounded-md bg-gray-50">
            <p className="text-sm mt-2 text-gray-700 whitespace-normal">
              {!isSubmitted ? (userAnswer || "Start recording or switch to writing mode to answer") : null}
            </p>
            {interimResult && (
              <p className="text-sm text-gray-500 mt-2">
                <strong>Current Speech:</strong>
                {interimResult}
              </p>
            )}
          </div>
        )}
        {isSubmitted && (
          <div className="mt-2 text-green-700 font-semibold">Answer submitted. You cannot edit it anymore.</div>
        )}
      </div>
    </>
  );
};
