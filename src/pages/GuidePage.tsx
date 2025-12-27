import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Users, GraduationCap, Star, Award, Sparkles, Crown } from "lucide-react";

interface GuidePageProps {
    user?: { name: string; role: 'customer' | 'admin' } | null;
    onLogout?: () => void;
}

export function GuidePage({ user, onLogout }: GuidePageProps) {
    const teamMembers = [
        { name: "MAGISESAN S", role: "Team Lead", icon: Crown, color: "text-yellow-500", bg: "bg-yellow-500/20", border: "border-yellow-500/50" },
        { name: "ABDUL AJEEZ", role: "Team Member", icon: User, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
        { name: "DANIEL RAJ", role: "Team Member", icon: User, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
        { name: "HARINESH", role: "Team Member", icon: User, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-[#0f172a] text-slate-100 overflow-hidden font-sans">
            <Navbar user={user} onLogout={onLogout} />

            {/* Decorative Background Elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 opacity-30 animate-pulse-slow"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 opacity-30"></div>
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.05]"></div>
            </div>

            <main className="flex-grow pt-32 pb-24 relative z-10">

                {/* Hero Section */}
                <section className="relative px-4 mb-24 text-center">
                    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
                        <Badge variant="outline" className="px-6 py-2 text-sm md:text-base border-yellow-500/30 bg-yellow-500/10 text-yellow-500 rounded-full backdrop-blur-sm shadow-gold">
                            <Sparkles className="w-4 h-4 mr-2 inline-block animate-spin-slow" />
                            Project Appreciation
                        </Badge>

                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
                            The Minds Behind <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-300 to-yellow-600 drop-shadow-sm">
                                The Vision
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            Honoring the guidance, leadership, and brilliance that drove this project to explicit success.
                        </p>
                    </div>
                </section>

                <div className="container max-w-6xl mx-auto px-4 space-y-24">

                    {/* Leadership Section */}
                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">

                        {/* Project Guide Card */}
                        <div className="group relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-primary rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                            <Card className="relative h-full bg-[#1e293b]/80 backdrop-blur-xl border-yellow-500/20 text-slate-200 hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <GraduationCap className="w-32 h-32" />
                                </div>
                                <CardHeader className="pl-8 pt-8">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20 mb-6 group-hover:scale-110 transition-transform duration-500">
                                        <GraduationCap className="w-8 h-8 text-black" />
                                    </div>
                                    <div className="space-y-1">
                                        <CardDescription className="text-yellow-500 font-semibold tracking-wider uppercase text-sm">Project Guide</CardDescription>
                                        <CardTitle className="text-3xl lg:text-4xl font-bold text-white">Mr. Ravichandran</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="pl-8 pb-8 pr-12">
                                    <p className="text-lg text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                                        "With deep gratitude for the invaluable guidance, technical wisdom, and mentorship provided throughout the development lifecycle."
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Project Incharge Card */}
                        <div className="group relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                            <Card className="relative h-full bg-[#1e293b]/80 backdrop-blur-xl border-indigo-500/20 text-slate-200 hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Award className="w-32 h-32" />
                                </div>
                                <CardHeader className="pl-8 pt-8">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-6 group-hover:scale-110 transition-transform duration-500">
                                        <Award className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <CardDescription className="text-indigo-400 font-semibold tracking-wider uppercase text-sm">Project Incharge</CardDescription>
                                        <CardTitle className="text-3xl lg:text-4xl font-bold text-white">Mr. K. Ashok Kumar <span className="text-lg opacity-70 font-normal">B.E</span></CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="pl-8 pb-8 pr-12">
                                    <p className="text-lg text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                                        "Thank you for the supervision, unwavering support, and critical insights that ensured the successful execution of this innovation."
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Team Members Section */}
                    <div className="space-y-12">
                        <div className="text-center space-y-4">
                            <div className="inline-flex items-center gap-2 text-yellow-500 font-medium tracking-wide uppercase text-sm">
                                <Users className="w-4 h-4" />
                                <span>The Development Squad</span>
                            </div>
                            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">Meet The Creators</h2>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {teamMembers.map((member, index) => (
                                <div key={index} className="group hover:-translate-y-3 transition-transform duration-300">
                                    <Card className={`h-full bg-[#1e293b]/50 backdrop-blur-md border-0 ring-1 ring-inset ${member.border} hover:bg-[#1e293b] transition-colors relative overflow-hidden`}>
                                        <div className={`absolute inset-0 bg-gradient-to-b ${member.role === 'Team Lead' ? 'from-yellow-500/10' : 'from-blue-500/5'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                        <CardHeader className="text-center pt-8 pb-4 relative z-10">
                                            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${member.bg} group-hover:scale-110 transition-all duration-500 ring-2 ring-offset-2 ring-offset-[#0f172a] ${member.color.replace('text', 'ring')}`}>
                                                <member.icon className={`w-8 h-8 ${member.color}`} />
                                            </div>
                                            <CardTitle className="font-bold text-xl text-slate-100">{member.name}</CardTitle>
                                            <div className="mt-2">
                                                <Badge variant="secondary" className={`${member.role === 'Team Lead' ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'} border-0 transition-colors`}>
                                                    {member.role === 'Team Lead' && <Crown className="w-3 h-3 mr-1 inline-block -mt-0.5" />}
                                                    {member.role}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quote Section */}
                    <div className="py-16 text-center">
                        <div className="relative inline-block max-w-3xl mx-auto">
                            <Star className="absolute -top-8 -left-8 w-16 h-16 text-yellow-500/10 rotate-12" />
                            <Star className="absolute -bottom-8 -right-8 w-12 h-12 text-yellow-500/10 -rotate-12" />
                            <blockquote className="text-2xl md:text-3xl font-serif italic text-slate-300 leading-relaxed">
                                <span className="text-yellow-500 text-4xl font-sans mr-2">"</span>
                                Innovation distinguishes between a leader and a follower. This project is a testament to teamwork, dedication, and the pursuit of excellence.
                                <span className="text-yellow-500 text-4xl font-sans ml-2">"</span>
                            </blockquote>
                            <div className="mt-6 flex justify-center gap-2">
                                <div className="w-16 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent rounded-full opacity-50"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
