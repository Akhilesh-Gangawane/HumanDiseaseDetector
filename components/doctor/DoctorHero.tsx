'use client';

import { Activity, Users, Calendar, ArrowRight } from 'lucide-react';
import { useSession } from 'next-auth/react';
import HeroScroll from '@/components/patient/HeroScroll';

export default function DoctorHero({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
    const { data: session } = useSession();
    const doctorName = session?.user?.name ?? 'Doctor';

    return (
        <section className="relative pt-20 pb-12 lg:pt-28 lg:pb-16 overflow-hidden border-b border-gray-100 bg-gradient-to-br from-blue-50/80 via-white/50 to-teal-50/80 backdrop-blur-sm">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-300/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-300/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="flex-1 space-y-8 animate-fade-in text-center md:text-left">
                        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-blue-200/50 shadow-sm mx-auto md:mx-0">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-sm font-medium text-gray-700">Dhanvantari AI Doctor Portal</span>
                        </div>

                        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight text-gray-900 tracking-tight">
                            Welcome back, <br />
                            <span className="bg-gradient-to-r from-blue-600 via-teal-600 to-blue-700 bg-clip-text text-transparent">
                                {doctorName}
                            </span>
                        </h1>

                        <p className="text-lg text-gray-600 leading-relaxed max-w-xl mx-auto md:mx-0">
                            Your intelligent clinical workspace. Review AI predictions, manage patient critical care, and access live pathology results.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => setActiveTab('appointments')}
                                className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl font-semibold shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center space-x-2"
                            >
                                <span>Today&apos;s Schedule</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('patients')}
                                className="w-full sm:w-auto px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl font-semibold border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:shadow-md transition-all duration-300"
                            >
                                Find Patient
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 w-full max-w-lg animate-fade-in flex flex-col gap-4">
                        {/* Interactive scroll animation */}
                        <div className="relative w-full h-[380px] rounded-2xl overflow-hidden shadow-xl border border-white/60">
                            <HeroScroll />
                        </div>

                        {/* Compact stat strip below the scroll */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 shadow-sm border border-white/60 flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                                    <Users className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Patients</p>
                                    <p className="text-lg font-bold text-gray-900">1,248</p>
                                </div>
                            </div>
                            <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 shadow-sm border border-white/60 flex items-center gap-3">
                                <div className="p-2 bg-teal-100 rounded-lg shrink-0">
                                    <Calendar className="w-4 h-4 text-teal-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Today</p>
                                    <p className="text-lg font-bold text-gray-900">12 Apts</p>
                                </div>
                            </div>
                            <div
                                className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl p-4 shadow-sm flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow group"
                                onClick={() => setActiveTab('ai-predictions')}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && setActiveTab('ai-predictions')}
                                aria-label="View AI Predictions"
                            >
                                <div className="p-2 bg-white/20 rounded-lg shrink-0">
                                    <Activity className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-blue-100 font-medium">AI Runs</p>
                                    <p className="text-lg font-bold text-white">84 <span className="text-xs font-normal text-teal-100">/ wk</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
