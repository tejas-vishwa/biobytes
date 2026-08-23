import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Terms & Conditions</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Please read these terms carefully before using QURIX.
            </p>
          </div>

          <Card className="shadow-neumorphic border-0 bg-glass backdrop-blur-md">
            <CardHeader className="space-y-1 pb-4 border-b">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
                <CardTitle className="text-2xl">AI Disclaimer</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                QURIX utilizes advanced Artificial Intelligence (AI) to extract, parse, and summarize medical reports. 
                While we strive for high accuracy, the AI can make mistakes or misinterpret complex medical terminology. 
                <strong> QURIX is not a substitute for professional medical advice, diagnosis, or treatment.</strong> 
                Always verify critical health information with a qualified healthcare provider before making any medical decisions.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-neumorphic border-0 bg-glass backdrop-blur-md">
            <CardHeader className="space-y-1 pb-4 border-b">
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-green-500" />
                <CardTitle className="text-2xl">Data Privacy & Security</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Your privacy is our utmost priority. All user documents, medical reports, and uploaded files are securely encrypted and saved within our protected database infrastructure. 
                We do not sell your personal health data to third parties. By using QURIX, you consent to the secure storage and AI processing of your uploaded documents strictly for the purpose of providing you with your personal health summaries and tracking metrics.
              </p>
            </CardContent>
          </Card>

          <div className="prose dark:prose-invert max-w-none pt-8 border-t border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400">
            <h3>1. Acceptance of Terms</h3>
            <p>By registering for and using QURIX, you agree to be bound by these Terms and Conditions.</p>
            
            <h3>2. User Responsibilities</h3>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
            
            <h3>3. Modifications</h3>
            <p>We reserve the right to modify these terms at any time. Continued use of the platform constitutes acceptance of updated terms.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
