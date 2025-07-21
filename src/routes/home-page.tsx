import { Sparkles } from "lucide-react";
import Marquee from "react-fast-marquee";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { MarqueImg } from "@/components/marquee-img";
import { Link } from "react-router-dom";

export const HomePage = () => {
  return (
    <div className="flex-col w-full pb-24 bg-gradient-to-br from-emerald-50 via-blue-50 to-white min-h-screen">
      <Container>
        <section className="flex flex-col md:flex-row items-center justify-between gap-10 py-16">
          <div className="flex-1 flex flex-col gap-6 items-start">
            <h1 className="text-5xl md:text-7xl font-extrabold text-emerald-700 leading-tight">
              Ace Your Next Interview
              <span className="block text-blue-600 font-bold text-3xl md:text-5xl mt-2">
                with AI-Powered Practice
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-xl">
              Get personalized questions, instant feedback, and actionable
              insights. Practice smarter, not harder.
            </p>
            <Link to="/generate">
              <Button className="mt-4 px-8 py-4 text-lg rounded-xl shadow-lg bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600">
                Start Practicing{" "}
                <Sparkles className="ml-2" />
              </Button>
            </Link>
          </div>
          <div className="flex-1 flex justify-center">
            <img
              src="/img/hero.jpg"
              alt="AI Interview"
              className="rounded-3xl shadow-2xl w-full max-w-lg object-cover"
            />
          </div>
        </section>
      </Container>

      

      <Container className="py-8 space-y-8">
        <h2 className="tracking-wide text-2xl md:text-3xl text-emerald-800 font-bold text-center">
          Unleash your potential with personalized AI insights and targeted
          interview practice.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
          <div className="col-span-1 md:col-span-3">
            <img
              src="/img/office.jpg"
              alt="Office"
              className="w-full max-h-96 rounded-2xl object-cover shadow-lg"
            />
          </div>
          <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center text-center gap-6">
            <p className="text-lg text-gray-600">
              Transform the way you prepare, gain confidence, and boost your
              chances of landing your dream job. Let AI be your edge in today's
              competitive job market.
            </p>
            <Link to={"/generate"} className="w-full">
              <Button className="w-3/4 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-lg rounded-xl shadow-lg">
                Generate <Sparkles className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
};
