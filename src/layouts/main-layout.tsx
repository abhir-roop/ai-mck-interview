import { Container } from "@/components/container";
import { Header } from "@/components/header";
import { Footer } from "@/views/footer";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-emerald-50 to-white text-gray-900">
      <Header />
      <Container className="flex-grow flex flex-col items-center justify-center px-4 py-8">
        <main className="w-full max-w-5xl flex-grow flex flex-col items-center justify-center">
          <Outlet />
        </main>
      </Container>
      <Footer />
    </div>
  );
};

export default MainLayout;
