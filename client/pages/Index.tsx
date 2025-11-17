import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
	Map,
	Wrench,
	Smartphone,
	BarChart,
	ShieldCheck,
	Users,
	ParkingCircle,
	CheckCircle,
	Facebook,
	Twitter,
	Linkedin,
	Mail,
} from "lucide-react";

const AVAILABILITY_REFRESH_MS = 60_000;

type AvailabilityState = {
	available: number | null;
	occupied: number | null;
	reserved: number | null;
	message: string;
	isError: boolean;
};

type FeatureCardProps = {
	icon: LucideIcon;
	title: string;
	description: string;
	accentClass: string;
	actionLabel?: string;
	onAction?: () => void;
};

type Stat = {
	label: string;
	value: string;
};

const heroHighlights = ["Free 30-day trial", "No setup fees"];

const stats: Stat[] = [
	{ label: "Vehicles Managed", value: "10,000+" },
	{ label: "Satisfied Clients", value: "500+" },
	{ label: "Uptime Guarantee", value: "99.9%" },
	{ label: "Customer Support", value: "24/7" },
];

function FeatureCard({
	icon: Icon,
	title,
	description,
	accentClass,
	actionLabel,
	onAction,
}: FeatureCardProps) {
	return (
		<div className="rounded-2xl bg-gray-50 p-6 lg:p-8 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
			<div
				className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center mb-4 lg:mb-6 ${accentClass}`}
			>
				<Icon className="h-5 w-5 sm:h-6 sm:w-6" />
			</div>
			<h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 lg:mb-4">
				{title}
			</h3>
			<p className="text-sm sm:text-base text-gray-600">{description}</p>
			{actionLabel && onAction ? (
				<button
					onClick={onAction}
					className="mt-4 text-sm sm:text-base font-semibold text-blue-600 hover:text-blue-700 transition-colors"
				>
					{actionLabel}
				</button>
			) : null}
		</div>
	);
}

function StatCard({ label, value }: Stat) {
	return (
		<div className="text-center">
			<div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{value}</div>
			<div className="text-sm sm:text-base lg:text-lg text-purple-100">{label}</div>
		</div>
	);
}

export default function Index() {
	const navigate = useNavigate();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [navShadow, setNavShadow] = useState(false);
	const [availability, setAvailability] = useState<AvailabilityState>({
		available: null,
		occupied: null,
		reserved: null,
		message: "Checking availability...",
		isError: false,
	});

	const features = useMemo(
		() => [
			{
				icon: Map,
				title: "Real-time GPS Tracking",
				description:
					"Monitor your fleet with live updates and detailed route history across every asset.",
				accentClass: "bg-blue-100 text-blue-600",
			},
			{
				icon: Wrench,
				title: "Maintenance Scheduling",
				description:
					"Automate service reminders and keep vehicles on the road with proactive alerts.",
				accentClass: "bg-green-100 text-green-600",
			},
			{
				icon: Smartphone,
				title: "Driver Mobile App",
				description:
					"Empower drivers to manage trips, submit inspections, and log expenses on the go.",
				accentClass: "bg-purple-100 text-purple-600",
			},
			{
				icon: BarChart,
				title: "Analytics & Reports",
				description:
					"Unlock insights into fuel, safety, and performance with configurable dashboards.",
				accentClass: "bg-yellow-100 text-yellow-600",
			},
			{
				icon: ShieldCheck,
				title: "Safety & Compliance",
				description:
					"Centralize documentation, monitor driver behavior, and reduce compliance risk.",
				accentClass: "bg-red-100 text-red-600",
			},
			{
				icon: Users,
				title: "User Management",
				description:
					"Control access for managers, dispatchers, and drivers with role-specific tooling.",
				accentClass: "bg-indigo-100 text-indigo-600",
			},
			{
				icon: ParkingCircle,
				title: "Live Parking Grid",
				description:
					"Check slot availability before arrival and jump straight into the parking workflow.",
				accentClass: "bg-blue-100 text-blue-600",
				actionLabel: "Explore Parking Grid →",
				onAction: () => navigate("/parking"),
			},
		],
		[navigate]
	);

	const socialLinks = useMemo(
		() => [
			{ id: "facebook", icon: Facebook, href: "#" },
			{ id: "twitter", icon: Twitter, href: "#" },
			{ id: "linkedin", icon: Linkedin, href: "#" },
			{ id: "mail", icon: Mail, href: "#" },
		],
		[]
	);

	const scrollToSection = useCallback((id: string) => {
		const target = document.getElementById(id);
		if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
	}, []);

	const openApp = useCallback(() => {
		navigate("/login");
	}, [navigate]);

	const loadParkingAvailability = useCallback(async () => {
		try {
			const response = await fetch("/api/parking/slots");
			if (!response.ok) throw new Error("Network error");
			const payload = await response.json();
			if (!payload?.success || !Array.isArray(payload.data)) throw new Error("Bad payload");

			const slots = payload.data;
			const available = slots.filter((slot: { status: string }) => slot.status === "AVAILABLE").length;
			const occupied = slots.filter((slot: { status: string }) => slot.status === "OCCUPIED").length;
			const reserved = slots.filter((slot: { status: string }) => slot.status === "RESERVED").length;

			setAvailability({
				available,
				occupied,
				reserved,
				message:
					available > 0
						? `Good news! ${available} slot${available > 1 ? "s are" : " is"} free right now.`
						: "Parking is currently full. Check back soon or explore alternate options.",
				isError: false,
			});
		} catch (error) {
			console.error("Failed to load parking availability:", error);
			setAvailability((prev) => ({
				available: null,
				occupied: null,
				reserved: null,
				message: "Live availability temporarily unavailable.",
				isError: true,
			}));
		}
	}, []);

	useEffect(() => {
		const handleScroll = () => setNavShadow(window.scrollY > 50);
		handleScroll();
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	useEffect(() => {
		loadParkingAvailability();
		const timer = window.setInterval(loadParkingAvailability, AVAILABILITY_REFRESH_MS);
		return () => window.clearInterval(timer);
	}, [loadParkingAvailability]);

	const availabilityStateClass =
		availability.isError || availability.available === 0
			? "bg-red-500/100 border-red-300"
			: "bg-white/10 border-white/20";

	return (
		<div className="bg-gray-50 min-h-screen">
			<nav
				className={`fixed inset-x-0 top-0 z-50 bg-white transition-shadow ${navShadow ? "shadow-lg" : ""}`}
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between h-16">
						<div className="flex items-center space-x-3">
							<div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center">
								<img src="icon.png" alt="VMS Logo" className="h-6 w-6" />
							</div>
							<span className="text-2xl font-bold text-gray-900">VMS</span>
						</div>
						<div className="hidden md:flex items-center space-x-4">
							<a
								href="#features"
								onClick={(event) => {
									event.preventDefault();
									scrollToSection("features");
								}}
								className="text-gray-600 hover:text-blue-600 transition-colors"
							>
								Features
							</a>
							<a
								href="#contact"
								onClick={(event) => {
									event.preventDefault();
									scrollToSection("contact");
								}}
								className="text-gray-600 hover:text-blue-600 transition-colors"
							>
								Contact
							</a>
							<button
								onClick={openApp}
								className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
							>
								Login
							</button>
						</div>
						<button
							className="md:hidden text-gray-600 hover:text-blue-600 p-2"
							onClick={() => setMobileMenuOpen((open) => !open)}
							aria-label="Toggle menu"
						>
							<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								{mobileMenuOpen ? (
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								) : (
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
								)}
							</svg>
						</button>
					</div>
				</div>
				{mobileMenuOpen ? (
					<div className="md:hidden bg-white border-t border-gray-200">
						<div className="px-4 py-3 space-y-3">
							<a
								href="#features"
								onClick={(event) => {
									event.preventDefault();
									scrollToSection("features");
									setMobileMenuOpen(false);
								}}
								className="block text-gray-600 hover:text-blue-600 transition-colors"
							>
								Features
							</a>
							<a
								href="#contact"
								onClick={(event) => {
									event.preventDefault();
									scrollToSection("contact");
									setMobileMenuOpen(false);
								}}
								className="block text-gray-600 hover:text-blue-600 transition-colors"
							>
								Contact
							</a>
							<button
								onClick={openApp}
								className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
							>
								Login
							</button>
						</div>
					</div>
				) : null}
			</nav>

			<main className="pt-24 lg:pt-28">
				<section className="bg-gradient-to-tr from-blue-500 to-blue-700 text-white pb-16 lg:pb-20">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
							<div className="text-center lg:text-left">
								<h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4 lg:mb-6">
									Intelligent Vehicle Fleet Management
								</h1>
								<p className="text-lg sm:text-xl text-blue-100 mb-6 lg:mb-8 max-w-2xl mx-auto lg:mx-0">
									Streamline operations with real-time visibility, proactive maintenance, and actionable analytics across your entire fleet.
								</p>
								<div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
									<button
										onClick={openApp}
										className="bg-white text-blue-600 px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base"
									>
										Get Started for Free
									</button>
								</div>
								<div
									className={`mt-6 lg:mt-8 rounded-xl p-5 sm:p-6 text-left border transition-colors ${availabilityStateClass}`}
								>
									<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
										<div>
											<p className="text-xs uppercase tracking-wide text-blue-100">
												Live Parking Availability
											</p>
											<p className="text-lg font-semibold text-white mt-1">
												check the availability
											</p>
										</div>
									</div>
									<div className="mt-4">
										<button
											onClick={() => navigate("/parking")}
											className="w-full sm:w-auto bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base"
										>
											View Parking Grid
										</button>
									</div>
								</div>
								<div className="mt-6 lg:mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-2 sm:space-y-0 sm:space-x-6 text-blue-100 text-sm sm:text-base">
									{heroHighlights.map((text) => (
										<div key={text} className="flex items-center">
											<CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
											<span>{text}</span>
										</div>
									))}
								</div>
							</div>
							<div className="mt-8 lg:mt-0">
								<div className="relative max-w-md mx-auto lg:max-w-none">
									<div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 transform lg:rotate-1">
										<div className="bg-gray-100 rounded-lg p-3 sm:p-4 lg:p-6">
											<div className="flex items-center justify-between mb-3 lg:mb-4">
												<h3 className="text-base sm:text-lg font-semibold text-gray-800">
													Fleet Dashboard
												</h3>
												<span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs sm:text-sm">
													Live
												</span>
											</div>
											<div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mb-3 lg:mb-4">
												<div className="bg-green-100 p-2 sm:p-3 rounded-lg text-center">
													<div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
														88
													</div>
													<div className="text-xs sm:text-sm text-gray-600">Active</div>
												</div>
												<div className="bg-red-100 p-2 sm:p-3 rounded-lg text-center">
													<div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">
														12
													</div>
													<div className="text-xs sm:text-sm text-gray-600">Inactive</div>
												</div>
												<div className="bg-yellow-100 p-2 sm:p-3 rounded-lg text-center">
													<div className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-600">
														4
													</div>
													<div className="text-xs sm:text-sm text-gray-600">Maintenance</div>
												</div>
											</div>
											<div className="bg-white p-2 sm:p-3 rounded-lg">
												<div className="text-xs sm:text-sm text-gray-600 mb-2">
													Fleet Utilization
												</div>
												<div className="w-full bg-gray-200 rounded-full h-2">
													<div className="bg-blue-600 h-2 rounded-full" style={{ width: "88%" }} />
												</div>
												<div className="text-right text-xs sm:text-sm text-gray-600 mt-1">
													88%
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section id="features" className="py-12 sm:py-16 lg:py-20 bg-white">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center mb-12 lg:mb-16">
							<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
								Powerful Features
							</h2>
							<p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
								Everything you need to manage your vehicle fleet efficiently and reduce operational costs.
							</p>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
							{features.map((feature) => (
								<FeatureCard key={feature.title} {...feature} />
							))}
						</div>
					</div>
				</section>

				<section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
							{stats.map((stat) => (
								<StatCard key={stat.label} {...stat} />
							))}
						</div>
					</div>
				</section>

				<section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-tr from-blue-500 to-blue-700 text-white">
					<div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
						<h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 lg:mb-6">
							Ready to Transform Your Fleet Management?
						</h2>
						<p className="text-lg sm:text-xl text-blue-100 mb-6 lg:mb-8">
							Join hundreds of businesses that trust our VMS for their daily operations.
						</p>
						
					</div>
				</section>
			</main>

			<footer id="contact" className="bg-gray-900 text-white py-12 lg:py-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
						<div className="sm:col-span-2">
							<div className="flex items-center mb-6">
								<div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center">
									<img src="icon.png" alt="VMS Logo" className="h-6 w-6" />
								</div>
								<span className="ml-3 text-xl sm:text-2xl font-bold">
									Vehicle Management System
								</span>
							</div>
							<p className="text-gray-300 mb-6 max-w-md text-sm sm:text-base">
								The leading vehicle management system trusted by fleets worldwide. Streamline operations, increase efficiency, and enhance driver safety.
							</p>
							<div className="flex space-x-4">
								{socialLinks.map(({ id, icon: Icon, href }) => (
									<a key={id} href={href} className="text-gray-400 hover:text-white transition-colors">
										<Icon className="h-5 w-5 sm:h-6 sm:w-6" />
									</a>
								))}
							</div>
						</div>
						<div>
							<h4 className="text-base sm:text-lg font-semibold mb-4 lg:mb-6">Product</h4>
							<ul className="space-y-2 lg:space-y-3 text-gray-300 text-sm sm:text-base">
								<li>
									<a
										href="#features"
										onClick={(event) => {
											event.preventDefault();
											scrollToSection("features");
										}}
										className="hover:text-white transition-colors"
									>
										Features
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										API Documentation
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Integrations
									</a>
								</li>
							</ul>
						</div>
						<div>
							<h4 className="text-base sm:text-lg font-semibold mb-4 lg:mb-6">Support</h4>
							<ul className="space-y-2 lg:space-y-3 text-gray-300 text-sm sm:text-base">
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Help Center
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Contact Support
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										System Status
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Security
									</a>
								</li>
							</ul>
						</div>
					</div>
					<div className="border-t border-gray-800 mt-8 lg:mt-12 pt-6 lg:pt-8 text-center text-gray-400 text-sm sm:text-base">
						<p>&copy; 2024 Vehicle Management System. All rights reserved.</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
