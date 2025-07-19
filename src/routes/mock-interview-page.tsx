import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Lightbulb } from "lucide-react";

import { db } from "@/config/firebase.config";
import { LoaderPage } from "@/views/loader-page";

import { CustomBreadCrumb } from "@/components/custom-bread-crumb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Interview } from "@/types";
import { QuestionSection } from "@/containers/question-section";

export const MockInterviewPage = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  if (!interviewId) {
    navigate("/generate", { replace: true });
  }

  useEffect(() => {
    if (interviewId) {
      const fetchInterview = async () => {
        setIsLoading(true);
        try {
          const interviewDoc = await getDoc(doc(db, "interviews", interviewId));
          if (interviewDoc.exists()) {
            setInterview({ ...interviewDoc.data() } as Interview);
          } else {
            navigate("/generate", { replace: true });
          }
        } catch (error) {
          console.log(error);
          toast("Error", {
            description: "Something went wrong. Please try again later..",
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchInterview();
    }
  }, [interviewId, navigate]);

  // Fullscreen logic
  const handleFullScreen = () => {
    if (!isFullScreen && pageRef.current) {
      if (pageRef.current.requestFullscreen) {
        pageRef.current.requestFullscreen();
      }
      setIsFullScreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  useEffect(() => {
    const onFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullScreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullScreenChange);
  }, []);

  if (isLoading) {
    return <LoaderPage className="w-full h-[70vh]" />;
  }

  return (
    <div ref={pageRef} className={`flex flex-col w-full gap-8 py-5 ${isFullScreen ? 'bg-white' : ''}`}>
      <div className="flex justify-end mb-2">
        <button
          onClick={handleFullScreen}
          className="px-4 py-2 rounded bg-emerald-600 text-white font-semibold shadow hover:bg-emerald-700 transition"
        >
          {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
        </button>
      </div>

      <CustomBreadCrumb
        breadCrumbPage="Start"
        breadCrumpItems={[
          { label: "Mock Interviews", link: "/generate" },
          {
            label: interview?.position || "",
            link: `/generate/interview/${interview?.id}`,
          },
        ]}
      />

      <div className="w-full">
        <Alert className="bg-sky-100 border border-sky-200 p-4 rounded-lg flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-sky-600" />
          <div>
            <AlertTitle className="text-sky-800 font-semibold">
              Important Note
            </AlertTitle>
            <AlertDescription className="text-sm text-sky-700 mt-1 leading-relaxed">
              Press "Record Answer" to begin answering the question. Once you
              finish the interview, you&apos;ll receive feedback comparing your
              responses with the ideal answers.
              <br />
              <br />
              <strong>Note:</strong>{" "}
              <span className="font-medium">Your video is never recorded.</span>{" "}
              You can disable the webcam anytime if preferred.
            </AlertDescription>
          </div>
        </Alert>
      </div>

      {interview?.questions && interview?.questions.length > 0 && (
        <div className="mt-4 w-full flex flex-col items-start gap-4">
          <QuestionSection questions={interview?.questions} />
        </div>
      )}
    </div>
  );
};
