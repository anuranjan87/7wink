import Head from 'next/head'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowRight, Code, Image as ImageIcon, Layout, Wand2 } from "lucide-react"
import Link from "next/link"
import { SignIn, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";


export default function TailwindGenieLanding() {
return (
<>
  <Head>
    <title>Tailwind Genie - AI-Powered Development Platform | Magical UI Creation</title>
    <meta name="description" content="Tailwind Genie: AI-powered development platform with Tailwind CSS UI generation, backend solutions, and 100+ templates for developers and designers. Unleash your creativity with magical ease." />
    <meta name="keywords" content="Tailwind Genie, Tailwind CSS, AI development, UI generation, templates, tools, backend solutions" />
    <link rel="canonical" href="https://tailwindgenie.com" />
  </Head>
  <div className="flex flex-col min-h-[100dvh]">
    <header className="px-4 lg:px-6 h-14 flex items-center border-b">
      <Link href="/" className="flex items-center justify-center">
        <Wand2 className="h-6 w-6 text-primary" />
        <span className="ml-2 text-xl font-bold">Tailwind Genie</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6">
        <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
          Features
        </Link>
        <Link href="#tools" className="text-sm font-medium hover:underline underline-offset-4">
          Tools
        </Link>
        <Link href="#templates" className="text-sm font-medium hover:underline underline-offset-4">
          Templates
        </Link>
        <Link href="#faq" className="text-sm font-medium hover:underline underline-offset-4">
          FAQ
        </Link>
      </nav>
    </header>
    <main className="flex-1 mx-auto">

 <div className="p-6">
      <h1 className="text-2xl font-bold">Clerk + Sonner Test</h1>

      {/* Signed-out users see SignIn */}
      <SignedOut>
        <SignIn />
      </SignedOut>

      {/* Signed-in users see UserButton */}
      <SignedIn>
        <p>Welcome! You're signed in.</p>
      
       
      </SignedIn>
    </div>

      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-primary/20 to-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Unleash Your Creativity with Tailwind Genie
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl lg:text-2xl">
                Harness the power of AI to generate stunning Tailwind CSS UIs, build robust backends, and access 100+ templates and tools for developers and designers.
              </p>
            </div>
            <div className="space-x-4">
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                Get Started
              </Link>
              <Link
                href="/documentation"
                className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <section id="features" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">
            Magical Features of Tailwind Genie
          </h2>
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
            <div className="flex flex-col items-center text-center">
              <Layout className="h-12 w-12 mb-4 text-primary" />
              <h3 className="text-xl font-bold">AI-Powered UI Generation</h3>
              <p className="text-muted-foreground mt-2">
                Describe your vision, and watch as Tailwind Genie conjures beautiful, responsive UIs using the power of Tailwind CSS and AI.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Code className="h-12 w-12 mb-4 text-primary" />
              <h3 className="text-xl font-bold">Intelligent Backend Solutions</h3>
              <p className="text-muted-foreground mt-2">
                Build robust backend systems with Tailwind Genie smart coding assistance, from API integrations to database management.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <ImageIcon className="h-12 w-12 mb-4 text-primary" />
              <h3 className="text-xl font-bold">Comprehensive Design Tools</h3>
              <p className="text-muted-foreground mt-2">
                Access a suite of design tools including advanced photo editors, image hosting, and AI-assisted design inspiration generators.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <section id="tools" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">
            Enchanted Tools for Developers
          </h2>
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col space-y-2">
              <h3 className="text-xl font-bold">Tailwind Playground</h3>
              <p className="text-muted-foreground">Experiment with Tailwind CSS in real-time, with AI suggestions and instant previews.</p>
            </div>
            <div className="flex flex-col space-y-2">
              <h3 className="text-xl font-bold">Advanced Photo Editor</h3>
              <p className="text-muted-foreground">Edit and enhance images with AI-powered tools, right within the Tailwind Genie platform.</p>
            </div>
            <div className="flex flex-col space-y-2">
              <h3 className="text-xl font-bold">Secure Image Hosting</h3>
              <p className="text-muted-foreground">Host and manage your images with built-in CDN support and optimization features.</p>
            </div>
            <div className="flex flex-col space-y-2">
              <h3 className="text-xl font-bold">AI Code Generation</h3>
              <p className="text-muted-foreground">Generate boilerplate code, complex functions, and even entire components with AI assistance.</p>
            </div>
          </div>
        </div>
      </section>
      
      <section id="templates" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">
            100+ Magical Templates for Inspiration
          </h2>
          <p className="text-center text-muted-foreground mb-8 max-w-[800px] mx-auto">
            Explore our vast library of enchanted templates for landing pages, dashboards, e-commerce sites, and more. All crafted with Tailwind CSS and ready for your magical touch.
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="aspect-video bg-muted"></div>
                <div className="p-4">
                  <h3 className="text-lg font-bold">Magical Template {i}</h3>
                  <p className="text-sm text-muted-foreground mt-2">A enchanting design for your next project</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="#"
              className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              Explore All Templates
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      
      <section id="faq" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is Tailwind Genie?</AccordionTrigger>
              <AccordionContent>
                Tailwind Genie is an AI-powered development platform that combines the power of Tailwind CSS with advanced AI to help developers and designers create stunning UIs, robust backends, and access a wide range of tools and templates.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How does the AI-powered UI generation work?</AccordionTrigger>
              <AccordionContent>
                Simply describe your desired UI in natural language, and Tailwind Genie AI will generate a responsive, Tailwind CSS-based design for you. You can then further customize and refine the generated UI to match your exact needs.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Can Tailwind Genie help with backend development?</AccordionTrigger>
              <AccordionContent>
                Yes! Tailwind Genie offers intelligent coding assistance for backend development, including API integrations, database management, and server-side logic. Our AI can help generate boilerplate code and even complex functions to accelerate your backend development process.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Is Tailwind Genie suitable for beginners?</AccordionTrigger>
              <AccordionContent>
                Tailwind Genie is designed to be user-friendly for developers of all skill levels. Beginners can leverage our AI-powered tools and templates to create professional-looking projects, while more experienced developers can use Tailwind Genie to boost their productivity and explore new design possibilities.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>How often are new templates and tools added?</AccordionTrigger>
              <AccordionContent>
                We regularly update our library of templates and tools to keep up with the latest design trends and development practices. New additions are typically made on a monthly basis, ensuring that you always have fresh inspiration and cutting-edge tools at your fingertips.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
      
      <section id="get-started" className="w-full py-12 md:py-24 lg:py-32 border-t">
        <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Start Your Magical Journey with Tailwind Genie Today
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Join thousands of developers and designers using Tailwind Genie to bring their creative visions to life with magical ease.
            </p>
          </div>
          <div className="mx-auto w-full max-w-sm space-y-2">
            <form className="flex flex-col gap-2">
              <Input type="email" placeholder="Enter your email" />
              <Button type="submit">Get Early Access</Button>
            </form>
            <p className="text-xs text-muted-foreground">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="underline underline-offset-2">
                Terms & Conditions
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
    <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
      <p className="text-xs text-muted-foreground">
        © {new Date().getFullYear()} Tailwind Genie. All rights reserved.
      </p>
      <nav className="sm:ml-auto flex gap-4 sm:gap-6">
        <Link href="#" className="text-xs hover:underline underline-offset-4">
          Terms of Service
        </Link>
        <Link href="#" className="text-xs hover:underline underline-offset-4">
          Privacy Policy
        </Link>
        <Link href="#" className="text-xs hover:underline underline-offset-4">
          Contact Us
        </Link>
      </nav>
    </footer>
  </div>
</>
)
}